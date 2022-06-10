import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from 'lodash'

import { Post } from "./post.model";
import { UtilService } from "../common/util.service";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private utilService: UtilService) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>("http://localhost:3000/api/posts")
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              image: post.imagePath,
              id: post.id,
            };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ message: string; data: Post }>(
      `http://localhost:3000/api/posts/${id}`
    ).pipe(map((response: any) => {
      response.data.image = response.data.imagePath.slice();
      delete response.data.imagePath;
      return response;
    }));
  }

  addPost(title: string, content: string, image: File) {
    const post: any = { title: title, content: content, image: image };
    const postData = this.makeFormData(post);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe((responseData) => {;
        this.posts.push({...responseData.post });
        this.postsUpdated.next([...this.posts]);
      });
  }

  makeFormData(data: any) {
    const formData = new FormData();
    _.forEach(data || {}, (_value: any, key: string) => {
        _value instanceof Blob ? formData.append(key, _value) : formData.append(key, _value ? JSON.stringify(_value) : '');
    });

    return formData;
  }

  updatePost(post: Post) {
    let postData;
    if(typeof post.image === 'string') {
      postData = { ...post };
      postData['imagePath'] = post.image;
      delete postData.image;
    } else {
      postData = this.makeFormData(post);
    }
    this.http
      .patch<{ message: string; data: Post }>(
        `http://localhost:3000/api/posts/${post.id}`,
        postData
      )
      .subscribe((result: { message: string; data: any }) => {
        const updatedPosts = this.posts.map((_post) =>
          _post.id === post.id ? 
            { ...result.data, 'image': result.data.imagePath }
            : _post
        );
        this.postsUpdated.next([...updatedPosts]);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete<{ message: string; data: null | undefined | unknown }>(
        "http://localhost:3000/api/posts/" + postId
      )
      .subscribe(() => {
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
