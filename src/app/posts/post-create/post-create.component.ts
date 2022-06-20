import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { mimeType } from "src/app/validators/mime-type.validator";
import { Post } from "../post.model";

import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  mode: string = "create";
  imagePreview: string;
  postForm: FormGroup;
  private postId: string;
  post: Post = {
    title: "",
    content: "",
    id: null,
    image: null,
  };

  constructor(
    public postsService: PostsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.postId = paramMap.get("postId");
        this.mode = "edit";
        this.postsService
          .getPost(this.postId)
          .subscribe((result: { message: string; data: any }) => {
            this.post = result.data;
            this.postForm.setValue({
              title: this.post.title,
              content: this.post.content,
              image: this.post.image,
            });
            this.imagePreview = this.post.image;
          });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  getControl(controlName: string): AbstractControl {
    return this.postForm.get(controlName);
  }

  initForm() {
    this.postForm = new FormGroup({
      title: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      content: new FormControl(null, [Validators.required]),
      image: new FormControl(null, [Validators.required], [mimeType]),
    });
  }

  imagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const fileReader = new FileReader();
    this.postForm.patchValue({
      image: file,
    });
    this.postForm.get("image").updateValueAndValidity();
    fileReader.onload = () => {
      this.imagePreview = fileReader.result as string;
    };
    fileReader.readAsDataURL(file);
  }

  onAddPost() {
    if (this.postForm.invalid) {
      return;
    }
    console.log("postForm", this.postForm);
    if (this.mode === "edit" && this.post.id) {
      const post: Post = {
        ...this.postForm.value,
        id: this.post.id,
      };
      this.postsService.updatePost(post);
    } else {
      this.postsService.addPost(
        this.postForm.value.title,
        this.postForm.value.content,
        this.postForm.value.image
      );
    }
    this.postForm.reset();
  }
}
