import { ActorSubclass } from '@dfinity/agent';
import { expect, it, Test } from 'azle/test';

// @ts-ignore this path may not exist when these tests are imported into other test projects
import { _SERVICE } from './dfx_generated/factorial/factorial.did';

export function getTests(factorialCanister: ActorSubclass<_SERVICE>): Test {
    return () => {
        it('calculates 0 factorial', async () => {
            const result = await factorialCanister.fac(0n);

            expect(result).toBe(1n);
        });

        it('calculates 5 factorial', async () => {
            const result = await factorialCanister.fac(5n);

            expect(result).toBe(120n);
        });

        it('calculates 20 factorial', async () => {
            const result = await factorialCanister.fac(20n);

            expect(result).toBe(2_432_902_008_176_640_000n);
        });

        it('calculates 50 factorial', async () => {
            const result = await factorialCanister.fac(50n);

            expect(result).toBe(
                30_414_093_201_713_378_043_612_608_166_064_768_844_377_641_568_960_512_000_000_000_000n
            );
        });

        it('calculates 100 factorial', async () => {
            const result = await factorialCanister.fac(100n);

            expect(result).toBe(
                93_326_215_443_944_152_681_699_238_856_266_700_490_715_968_264_381_621_468_592_963_895_217_599_993_229_915_608_941_463_976_156_518_286_253_697_920_827_223_758_251_185_210_916_864_000_000_000_000_000_000_000_000n
            );
        });

        // TODO: Fails with `Canister trapped explicitly: Panicked at 'TODO needs error info'`
        it.skip('calculates 1000 factorial', async () => {
            const result = await factorialCanister.fac(1000n);

            expect(result).toBe(
                402_387_260_077_093_773_543_702_433_923_003_985_719_374_864_210_714_632_543_799_910_429_938_512_398_629_020_592_044_208_486_969_404_800_479_988_610_197_196_058_631_666_872_994_808_558_901_323_829_669_944_590_997_424_504_087_073_759_918_823_627_727_188_732_519_779_505_950_995_276_120_874_975_462_497_043_601_418_278_094_646_496_291_056_393_887_437_886_487_337_119_181_045_825_783_647_849_977_012_476_632_889_835_955_735_432_513_185_323_958_463_075_557_409_114_262_417_474_349_347_553_428_646_576_611_667_797_396_668_820_291_207_379_143_853_719_588_249_808_126_867_838_374_559_731_746_136_085_379_534_524_221_586_593_201_928_090_878_297_308_431_392_844_403_281_231_558_611_036_976_801_357_304_216_168_747_609_675_871_348_312_025_478_589_320_767_169_132_448_426_236_131_412_508_780_208_000_261_683_151_027_341_827_977_704_784_635_868_170_164_365_024_153_691_398_281_264_810_213_092_761_244_896_359_928_705_114_964_975_419_909_342_221_566_832_572_080_821_333_186_116_811_553_615_836_546_984_046_708_975_602_900_950_537_616_475_847_728_421_889_679_646_244_945_160_765_353_408_198_901_385_442_487_984_959_953_319_101_723_355_556_602_139_450_399_736_280_750_137_837_615_307_127_761_926_849_034_352_625_200_015_888_535_147_331_611_702_103_968_175_921_510_907_788_019_393_178_114_194_545_257_223_865_541_461_062_892_187_960_223_838_971_476_088_506_276_862_967_146_674_697_562_911_234_082_439_208_160_153_780_889_893_964_518_263_243_671_616_762_179_168_909_779_911_903_754_031_274_622_289_988_005_195_444_414_282_012_187_361_745_992_642_956_581_746_628_302_955_570_299_024_324_153_181_617_210_465_832_036_786_906_117_260_158_783_520_751_516_284_225_540_265_170_483_304_226_143_974_286_933_061_690_897_968_482_590_125_458_327_168_226_458_066_526_769_958_652_682_272_807_075_781_391_858_178_889_652_208_164_348_344_825_993_266_043_367_660_176_999_612_831_860_788_386_150_279_465_955_131_156_552_036_093_988_180_612_138_558_600_301_435_694_527_224_206_344_631_797_460_594_682_573_103_790_084_024_432_438_465_657_245_014_402_821_885_252_470_935_190_620_929_023_136_493_273_497_565_513_958_720_559_654_228_749_774_011_413_346_962_715_422_845_862_377_387_538_230_483_865_688_976_461_927_383_814_900_140_767_310_446_640_259_899_490_222_221_765_904_339_901_886_018_566_526_485_061_799_702_356_193_897_017_860_040_811_889_729_918_311_021_171_229_845_901_641_921_068_884_387_121_855_646_124_960_798_722_908_519_296_819_372_388_642_614_839_657_382_291_123_125_024_186_649_353_143_970_137_428_531_926_649_875_337_218_940_694_281_434_118_520_158_014_123_344_828_015_051_399_694_290_153_483_077_644_569_099_073_152_433_278_288_269_864_602_789_864_321_139_083_506_217_095_002_597_389_863_554_277_196_742_822_248_757_586_765_752_344_220_207_573_630_569_498_825_087_968_928_162_753_848_863_396_909_959_826_280_956_121_450_994_871_701_244_516_461_260_379_029_309_120_889_086_942_028_510_640_182_154_399_457_156_805_941_872_748_998_094_254_742_173_582_401_063_677_404_595_741_785_160_829_230_135_358_081_840_096_996_372_524_230_560_855_903_700_624_271_243_416_909_004_153_690_105_933_983_835_777_939_410_970_027_753_472_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n
            );
        });
    };
}
