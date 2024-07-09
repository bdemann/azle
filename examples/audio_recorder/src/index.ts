import {
    blob,
    Canister,
    ic,
    nat64,
    Opt,
    Principal,
    query,
    Record,
    StableBTreeMap,
    text,
    update,
    Vec
} from 'azle/experimental';

const User = Record({
    id: Principal,
    createdAt: nat64,
    recordingIds: Vec(Principal),
    username: text
});
type User = typeof User.tsType;

const Recording = Record({
    id: Principal,
    audio: blob,
    createdAt: nat64,
    name: text,
    userId: Principal
});
type Recording = typeof Recording.tsType;

let users = StableBTreeMap<Principal, User>(0);
let recordings = StableBTreeMap<Principal, Recording>(1);

export default Canister({
    createUser: update([text], User, (username) => {
        const id = generateId();
        const user: User = {
            id,
            createdAt: ic.time(),
            recordingIds: [],
            username
        };

        users.insert(user.id, user);

        return user;
    }),
    readUsers: query([], Vec(User), () => {
        return users.values();
    }),
    readUserById: query([Principal], Opt(User), (id) => {
        return users.get(id);
    }),
    deleteUser: update([Principal], User, (id) => {
        const userOpt = users.get(id);

        if ('None' in userOpt) {
            throw new Error(`User does not exist: ${id.toText()}`);
        }

        const user = userOpt.Some;

        user.recordingIds.forEach((recordingId) => {
            recordings.remove(recordingId);
        });

        users.remove(user.id);

        return user;
    }),
    createRecording: update(
        [blob, text, Principal],
        Recording,
        (audio, name, userId) => {
            const userOpt = users.get(userId);

            if ('None' in userOpt) {
                throw new Error(`User does not exist: ${userId.toText()}`);
            }

            const user = userOpt.Some;

            const id = generateId();
            const recording: Recording = {
                id,
                audio,
                createdAt: ic.time(),
                name,
                userId
            };

            recordings.insert(recording.id, recording);

            const updatedUser: User = {
                ...user,
                recordingIds: [...user.recordingIds, recording.id]
            };

            users.insert(updatedUser.id, updatedUser);

            return recording;
        }
    ),
    readRecordings: query([], Vec(Recording), () => {
        return recordings.values();
    }),
    readRecordingById: query([Principal], Opt(Recording), (id) => {
        return recordings.get(id);
    }),
    deleteRecording: update([Principal], Recording, (id) => {
        const recordingOpt = recordings.get(id);

        if ('None' in recordingOpt) {
            throw new Error(`Recording does not exist: ${id.toText()}`);
        }

        const recording = recordingOpt.Some;

        const userOpt = users.get(recording.userId);

        if ('None' in userOpt) {
            throw new Error(
                `User does not exist: ${recording.userId.toText()}`
            );
        }

        const user = userOpt.Some;

        const updatedUser: User = {
            ...user,
            recordingIds: user.recordingIds.filter(
                (recordingId) => recordingId.toText() !== recording.id.toText()
            )
        };

        users.insert(updatedUser.id, updatedUser);

        recordings.remove(id);

        return recording;
    })
});

function generateId(): Principal {
    const randomBytes = new Array(29)
        .fill(0)
        .map((_) => Math.floor(Math.random() * 256));

    return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}
