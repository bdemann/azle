import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

import { yellow } from './utils/colors';

const DEFAULT_KILL_SWITCH: Consumer['killSwitch'] = true;
const DEFAULT_SHARED_PERCENTAGE: Consumer['sharedPercentage'] = 10;
const DEFAULT_PERIOD: Consumer['period'] = 1_440;
const DEFAULT_SHARING_HEURISTIC: Consumer['sharingHeuristic'] =
    'BURNED_WEIGHTED_HALVING';
const DEFAULT_WEIGHT: Dependency['weight'] = 1;

export type Consumer = {
    killSwitch: boolean;
    sharedPercentage: number;
    period: number;
    sharingHeuristic: 'BURNED_WEIGHTED_HALVING';
    depthWeights: DepthWeights;
    dependencies: Dependency[];
};

export type DepthWeights = {
    [key: number]: number;
};

export type Dependency = {
    name: string;
    depth: number;
    weight: number;
    platform: string;
    asset: string;
    paymentMechanism: string;
    custom: Record<string, any>;
};

export type ConsumerConfig = {
    killSwitch?: Consumer['killSwitch'];
    sharedPercentage?: Consumer['sharedPercentage'];
    period?: Consumer['period'];
    sharingHeuristic?: Consumer['sharingHeuristic'];
    weights?: {
        [packageName: string]: number;
    };
};

export type DependencyConfig = {
    platform: Dependency['platform'];
    asset: Dependency['asset'];
    payment_mechanism: Dependency['paymentMechanism'];
    custom: Dependency['custom'];
};

type DependencyTree = {
    name: string;
    dependencies?: DependenciesInTree;
};

type DependenciesInTree = {
    [name: string]: DependencyInTree;
};

type DependencyInTree = {
    version: string;
    resolved: string;
    overriden: boolean;
    dependencies?: DependenciesInTree;
};

export async function getConsumer(): Promise<Consumer> {
    const consumerConfig = await getConsumerConfig();

    logWarningPeriod(consumerConfig);

    const dependenciesUnnormalized =
        await getDependenciesUnnormalized(consumerConfig);
    const dependencies = normalizeDependencies(dependenciesUnnormalized);

    const depthWeights = getDepthWeights(dependencies);

    return {
        killSwitch: consumerConfig?.killSwitch ?? DEFAULT_KILL_SWITCH,
        sharedPercentage:
            consumerConfig?.sharedPercentage ?? DEFAULT_SHARED_PERCENTAGE,
        period: consumerConfig?.period ?? DEFAULT_PERIOD,
        sharingHeuristic:
            consumerConfig?.sharingHeuristic ?? DEFAULT_SHARING_HEURISTIC,
        dependencies,
        depthWeights
    };
}

async function getConsumerConfig(): Promise<ConsumerConfig | undefined> {
    return JSON.parse((await readFile('./package.json')).toString())
        .openValueSharing;
}

function logWarningPeriod(consumerConfig?: ConsumerConfig) {
    if (consumerConfig?.period !== undefined) {
        console.warn(
            yellow(
                `\nAzle OpenValueSharing: to avoid problematic behavior, it is not currently recommended to change the period manually\n`
            )
        );
    }
}

async function getDependenciesUnnormalized(
    consumerConfig?: ConsumerConfig
): Promise<Dependency[]> {
    const dependencyConfigPaths = await glob(
        'node_modules/**/.openvaluesharing.json'
    );

    const dependencyTree: DependencyTree = JSON.parse(
        execSync(`npm ls --all --json`).toString().trim()
    );

    return await dependencyConfigPaths.reduce(
        async (acc: Promise<Dependency[]>, dependencyConfigPath) => {
            const accResolved = await acc;

            const npmPackagePath = dependencyConfigPath.replace(
                '/.openvaluesharing.json',
                ''
            );

            const npmPackageName = await getNpmPackageName(npmPackagePath);

            const dependencyConfigIcp =
                await getDependencyConfigIcp(dependencyConfigPath);

            if (dependencyConfigIcp === undefined) {
                return accResolved;
            }

            const { payment_mechanism, ...dependencyConfigIcpProps } =
                dependencyConfigIcp;

            const depth = getNpmPackageDepth(
                dependencyTree.dependencies,
                npmPackageName
            );

            if (depth === null) {
                throw new Error(
                    `Open Value Sharing: could not determine depth for package "${npmPackageName}"`
                );
            }

            return [
                ...accResolved,
                {
                    name: npmPackageName,
                    depth,
                    weight:
                        consumerConfig?.weights?.[npmPackageName] ??
                        DEFAULT_WEIGHT,
                    ...dependencyConfigIcpProps,
                    paymentMechanism: payment_mechanism
                }
            ];
        },
        Promise.resolve([])
    );
}

async function getNpmPackageName(npmPackagePath: string): Promise<string> {
    const packageJsonString = (
        await readFile(`${npmPackagePath}/package.json`)
    ).toString();
    const packageJson: { [key: string]: any; name: string } =
        JSON.parse(packageJsonString);
    const npmPackageName = packageJson.name;

    return npmPackageName;
}

async function getDependencyConfigIcp(
    dependencyConfigPath: string
): Promise<DependencyConfig | undefined> {
    const dependencyConfigs: DependencyConfig[] = JSON.parse(
        (await readFile(dependencyConfigPath)).toString()
    );

    const dependencyConfigsIcp = dependencyConfigs.filter(
        (dependencyConfig) => dependencyConfig.platform === 'icp'
    );
    const dependencyConfigIcp = dependencyConfigsIcp[0];

    return dependencyConfigIcp;
}

function getNpmPackageDepth(
    dependencies: DependenciesInTree | undefined,
    npmPackageName: string,
    depth: number = 0
): number | null {
    const finalDepth = Object.entries(dependencies ?? {}).reduce(
        (acc: number | null, [dependencyName, dependencyValue]) => {
            if (acc !== null) {
                return acc;
            } else {
                if (dependencyName === npmPackageName) {
                    return depth;
                }

                return getNpmPackageDepth(
                    dependencyValue.dependencies,
                    npmPackageName,
                    depth + 1
                );
            }
        },
        null
    );

    return finalDepth;
}

function normalizeDependencies(dependencies: Dependency[]): Dependency[] {
    const dependenciesTrimmed = dependencies.filter(
        (dependency) => dependency.weight !== 0
    );

    const uniqueDepths = [
        ...new Set(dependenciesTrimmed.map((dependency) => dependency.depth))
    ].sort((a, b) => a - b);

    const depthMapping = uniqueDepths.reduce((map, depth, index) => {
        return map.set(depth, index);
    }, new Map<number, number>());

    const normalizedDependencies = dependenciesTrimmed
        .map((dependency) => {
            const depth = depthMapping.get(dependency.depth);

            if (depth === undefined) {
                throw new Error(
                    `Open Value Sharing: depth for package "${dependency.name}" cannot be undefined`
                );
            }

            return {
                ...dependency,
                depth
            };
        })
        .sort((a, b) => {
            if (a.depth !== b.depth) {
                return a.depth - b.depth;
            } else {
                return a.name.localeCompare(b.name);
            }
        });

    return normalizedDependencies;
}

function getDepthWeights(dependencies: Dependency[]): DepthWeights {
    return dependencies.reduce((acc: DepthWeights, dependency) => {
        return {
            ...acc,
            [dependency.depth]: (acc[dependency.depth] ?? 0) + dependency.weight
        };
    }, {});
}
