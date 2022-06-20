import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import * as _ from "lodash";

import { Post } from "./post.model";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], count: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(page: number, limit: number) {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString())
    this.http
      .get<{ message: string; posts: any, count: number }>("http://localhost:3000/api/posts", { params: params })
      .pipe(
        map((postData) => {
          return { posts: postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              image: post.imagePath,
              id: post.id,
            };
          }), count: postData.count };
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts.posts;
        this.postsUpdated.next({ posts: [...this.posts], count: transformedPosts.count });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http
      .get<{ message: string; data: Post }>(
        `http://localhost:3000/api/posts/${id}`
      )
      .pipe(
        map((response: any) => {
          response.data.image = response.data.imagePath.slice();
          delete response.data.imagePath;
          return response;
        })
      );
  }

  addPost(title: string, content: string, image: File) {
    const post: any = { title: title, content: content, image: image };
    const postData = this.makeFormData(post);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      });
  }

  makeFormData(data: any) {
    const formData = new FormData();
    _.forEach(data || {}, (_value: any, key: string) => {
      _value instanceof Blob
        ? formData.append(key, _value)
        : formData.append(key, _value ? JSON.stringify(_value) : "");
    });

    return formData;
  }

  updatePost(post: Post) {
    const postData = this.makeFormData(post);
    this.http
      .patch<{ message: string; data: Post }>(
        `http://localhost:3000/api/posts/${post.id}`,
        postData
      )
      .subscribe((result: { message: string; data: any }) => {
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete<{ message: string; data: null | undefined | unknown }>(
        "http://localhost:3000/api/posts/" + postId
      )
  }
}
