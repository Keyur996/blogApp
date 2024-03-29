import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from "@angular/material";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"],
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isAuthenticated: boolean = false;
  private postsSub: Subscription;
  private authSub: Subscription;
  isLoading = false;
  totalPosts: number = 0;
  postsPerPage: number = 2;
  currentPage: number = 1;
  pageSizeOptions = [1, 2, 5, 10];

  constructor(public postsService: PostsService, private $auth: AuthService) {}

  ngOnInit() {
    this.postsService.getPosts(this.currentPage, this.postsPerPage);
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe(({ posts, count }: { posts: Post[]; count: number }) => {
        this.posts = posts;
        this.totalPosts = count;
      });
    this.authSub = this.$auth.getAuthStatusListener().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    })
  }

  onDelete(postId: string) {
    this.postsService
      .deletePost(postId)
      .subscribe((res: { message: string; data: null | undefined }) => {
        this.postsService.getPosts(this.currentPage, this.postsPerPage);
      });
  }

  pageChanged(event: PageEvent) {
    this.postsService.getPosts(event.pageIndex + 1, event.pageSize);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
