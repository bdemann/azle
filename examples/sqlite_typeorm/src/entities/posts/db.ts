import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import { getUser, User } from '../users/db';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    body: string;

    // TODO make this required
    @ManyToOne(() => User)
    user: User;
}

// TODO no better way to do these types?
export type PostCreate = {
    title: Post['title'];
    body: Post['body'];
    user_id: User['id'];
};
export type PostUpdate = Pick<Post, 'id'> & Partial<PostCreate>;

export async function getPosts(limit: number, offset: number): Promise<Post[]> {
    return await Post.find({
        take: limit,
        skip: offset,
        relations: {
            user: true
        }
    });
}

export async function getPost(id: number): Promise<Post | null> {
    return await Post.findOne({
        where: {
            id
        },
        relations: {
            user: true
        }
    });
}

export async function countPosts(): Promise<number> {
    return await Post.count(); // TODO might fail with a full table scan
}

export async function createPost(postCreate: PostCreate): Promise<Post> {
    let post = new Post();

    post.title = postCreate.title;
    post.body = postCreate.body;

    const user = await getUser(postCreate.user_id);

    if (user === null) {
        throw new Error(``);
    }

    post.user = user;

    return await post.save();
}

export async function updatePost(postUpdate: PostUpdate): Promise<Post> {
    console.log('postUpdate', postUpdate);

    await Post.update(postUpdate.id, {
        title: postUpdate.title,
        body: postUpdate.body,
        // TODO really make sure this part works
        user: {
            id: postUpdate.id
        }
    });

    const post = await getPost(postUpdate.id);

    if (post === null) {
        throw new Error(`updatePost: failed for id ${postUpdate.id}`);
    }

    return post;
}

export async function deletePost(id: number): Promise<number> {
    const deleteResult = await Post.delete(id);

    if (deleteResult.affected === 0) {
        throw new Error(`deletePost: could not delete post with id ${id}`);
    }

    return id;
}
