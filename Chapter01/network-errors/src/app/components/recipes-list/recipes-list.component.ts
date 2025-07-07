import { Component, ElementRef, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, fromEvent, map, Observable, startWith, Subscription, switchMap } from 'rxjs';
import { RecipeItemComponent } from '../recipe-item/recipe-item.component';
import { Recipe } from '../../types/recipes.type';
import { RecipesService } from '../../services/recipes.service';


@Component({
    selector: 'app-recipes-list',
    imports: [CommonModule, RecipeItemComponent, AsyncPipe, MatButton],
    templateUrl: './recipes-list.component.html',
    styleUrl: './recipes-list.component.scss'
})
export class RecipesListComponent {
  private recipesSubscription: Subscription | undefined;
  recipes: Recipe[] = [];
  showRetryButton$: Observable<boolean> = this.recipesService.showRetryButton$;

  constructor(private recipesService: RecipesService) { }

  @ViewChild('searchNameInput') 
    searchNameInputElement!: ElementRef;

  ngAfterViewInit() {
      fromEvent<InputEvent>(
          this.searchNameInputElement.nativeElement,'input')
          .pipe(
              map((searchInput: InputEvent) =>
                  (searchInput.target as HTMLInputElement)
                      .value),
              startWith(''), debounceTime(500),
              distinctUntilChanged(),
              switchMap((searchName: string) => 
                  this.recipesService.searchRecipes$(searchName)))
              .subscribe((recipes) => this.recipes = recipes as Recipe[]);
  }

  ngOnInit() {
    // Retry strategy
    // this.recipesSubscription = this.recipesService.getRecipes$().subscribe({
    //   next: (recipes) => {
    //     this.recipes = recipes;
    //   }
    // });

    // Exponential back off strategy
    // this.recipesSubscription = this.recipesService.getRecipesWithBackoffStrategy$().subscribe({
    //   next: (recipes) => {
    //     this.recipes = recipes;
    //   }
    // });

    // Circuit breaker strategy
    this.recipesSubscription = this.recipesService.getRecipesWithCircuitBreakerStrategy$().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
      }
    });
  }

  ngOnDestroy() {
    this.recipesSubscription?.unsubscribe();
  }

  getRecipes() {
    this.recipesSubscription = this.recipesService.getRecipesWithCircuitBreakerStrategy$().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
      }
    });
  }

}
