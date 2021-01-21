import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';

@Injectable({providedIn: 'root'})
export class PostsService {
  private _posts: Post[] = [];
  private _postsUpdated = new Subject<Post[]>();

  constructor(private _http: HttpClient) {}

  getPosts() {
    return this._http.get<{ message: string, posts: any }>('http://localhost:8080/api/posts')
      .pipe(map((data) => {
        // console.log('The original data', data.posts);
        return data.posts.map((post) => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          }
        });
        
      }))
      .subscribe((posts) => {
        // console.log('The transformed data', posts);
        this._posts = posts;
        this._postsUpdated.next([...this._posts]);
      });
  }

  getPost(id: string) {
    // return {...this._posts.find((post) => post.id === id)};
    return this._http.get<{_id: string, title: string, content: string}>(
      'http://localhost:8080/api/posts/' + id
    );
  }

  getPostsUpdatedListener() {
    return this._postsUpdated.asObservable();
  }

  addPost(id: string, title: string, content: string) {
    const post: Post = {
      id: id,
      title: title,
      content: content
    };

    this._http.post<{ message: string, id: string }>('http://localhost:8080/api/posts', post)
      .subscribe((data) => {
        console.log(data.message);
        post.id = data.id;
        this._posts.push(post);
        this._postsUpdated.next([...this._posts]);
      });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = {
      id: id,
      title: title,
      content: content
    };

    this._http.put<{ message: string, id: string }>('http://localhost:8080/api/posts/' + id, post)
      .subscribe((data) => {
        console.log(data.message);
      });
  }

  deletePost(id: string) {
    this._http.delete<{ message: string }>('http://localhost:8080/api/posts/' + id)
      .subscribe((data) => {
        console.log(data.message);
        const updatedPosts = this._posts.filter((post) => post.id !== id);
        this._posts = updatedPosts;
        this._postsUpdated.next([...this._posts]);
      });
  }
}