import { provideHttpClient } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { http, HttpResponse } from 'msw';

import { server } from '../../mocks/node';
import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        RecipesService
      ]
    });
    service = TestBed.inject(RecipesService);
  });

  beforeAll(() => {
    server.listen();
  });

  test('should fetch a list of recipes', async () => {
    const recipes$ = service.getRecipes$()
    const response = await firstValueFrom(recipes$)

    expect(response).toStrictEqual([
      {
        "id": 1,
        "name": "Spaghetti Aglio e Olio",
        "description": "Simple yet flavorful pasta with garlic, olive oil, and chili flakes",
        "ingredients": ["spaghetti", "garlic", "olive oil", "chili flakes", "parmesan cheese", "parsley"]
      },
      {
        "id": 2,
        "name": "Chicken Tikka Masala",
        "description": "Creamy, spiced Indian curry with tender chicken pieces.",
        "ingredients": ["chicken breasts", "yogurt", "garam masala", "turmeric", "cumin", "tomatoes", "onion", "ginger", "garlic", "heavy cream"]
      }
    ])
  });

  test('should fetch recipe details', async () => {
    const dummyRecipe = {
      id: 1,
      name: 'Spaghetti Aglio e Olio',
      description: 'Simple yet flavorful pasta with garlic, olive oil, and chili flakes',
      ingredients: ["spaghetti", "garlic", "olive oil", "chili flakes", "parmesan cheese", "parsley"]
    };
    const dummyDetails = {
      id: 1,
      prepTime: 7200000,
      cuisine: 'Italian',
      diet: 'Vegetarian',
      url: '/assets/images/spaghetti.jpg',
      nutrition: { calories: 450, fat: 15, carbs: 70, protein: 10 }
    };
    const recipes$ = service.getRecipeDetails$(dummyRecipe.id)
    const {
      recipe,
      details
    } = await firstValueFrom(recipes$)
    expect(recipe).toEqual(dummyRecipe);
    expect(details).toEqual(dummyDetails);
  });

  test('should fetch recipes with images in parallel', async () => {
    // 
    const dummyImages = [
      {
        "id": 1,
        "url": "/assets/images/spaghetti.jpg"
      },
      {
        "id": 2,
        "url": "/assets/images/chicken_tikka_masala.jpg"
      },
    ];
    const recipes$ = service.getRecipesWithImageInParallel$()
    const images = await firstValueFrom(recipes$)
    expect(images).toStrictEqual(dummyImages);
  });

  test('request error', waitForAsync(async () => {
    server.use(
      http.get('https://super-recipes.com/api/recipes', async () => {
        return HttpResponse.error()
      })
    );

    const recipes$ = service.getRecipes$()

    const errorResponse = await firstValueFrom(recipes$)
    expect(errorResponse.message).toStrictEqual('Something went wrong.');
  }));
});
