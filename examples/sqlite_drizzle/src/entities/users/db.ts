// TODO make sure we are doing all of this in the best way possible

import { desc, eq } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { DrizzleDb } from '../../db';

export const Users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    username: text('username').unique().notNull(),
    age: integer('age').notNull()
});
export type User = typeof Users.$inferSelect;
export type UserCreate = Omit<User, 'id'>;
export type UserUpdate = Pick<User, 'id'> & Partial<UserCreate>;

export async function getUsers(
    db: DrizzleDb,
    limit: number,
    offset: number
): Promise<User[]> {
    return await db.select().from(Users).limit(limit).offset(offset);
}

export async function getUser(
    drizzleDb: DrizzleDb,
    id: number
): Promise<User | null> {
    const results = await drizzleDb
        .select()
        .from(Users)
        .where(eq(Users.id, id));

    if (results.length === 0) {
        return null;
    } else {
        return results[0];
    }
}

export async function countUsers(drizzleDb: DrizzleDb): Promise<number> {
    const results = await drizzleDb
        .select({
            id: Users.id
        })
        .from(Users)
        .orderBy(desc(Users.id))
        .limit(1);

    if (results.length === 0) {
        return 0;
    } else {
        return results[0].id;
    }
}

export async function createUser(
    drizzleDb: DrizzleDb,
    userCreate: UserCreate
): Promise<User> {
    const results = await drizzleDb
        .insert(Users)
        .values(userCreate)
        .returning();

    const user = results[0];

    if (user === undefined) {
        throw new Error(`createUser failed`);
    }

    return user;
}

export async function updateUser(
    drizzleDb: DrizzleDb,
    userUpdate: UserUpdate
): Promise<User> {
    const results = await drizzleDb
        .update(Users)
        .set(userUpdate)
        .where(eq(Users.id, userUpdate.id))
        .returning();
    const user = results[0];

    if (user === undefined) {
        throw new Error(`updateUser failed for id ${userUpdate.id}`);
    }

    return user;
}

export async function deleteUser(
    drizzleDb: DrizzleDb,
    id: number
): Promise<number> {
    const results = await drizzleDb
        .delete(Users)
        .where(eq(Users.id, id))
        .returning({
            id: Users.id
        });
    const user = results[0];

    if (user === undefined) {
        throw new Error(`deleteUser failed for id ${id}`);
    }

    return user.id;
}
