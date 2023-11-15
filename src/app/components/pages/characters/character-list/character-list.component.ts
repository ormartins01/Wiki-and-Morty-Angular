import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  ParamMap,
  Router,
} from '@angular/router';

import { filter, take } from 'rxjs';
import { Character } from 'src/app/shared/Interfaces/character.interface';
import { CharacterService } from 'src/app/shared/services/character.service';

type RequestInfo = {
  next: string | null;
};

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss'],
})
export class CharacterListComponent {
  characters: Character[] = [];

  info: RequestInfo = {
    next: null,
  };
  showGoUpButton = false;
  thisPage = 'character';
  private pageNum = 1;
  private query!: string;
  private hideScrollHeight = 200;
  private showScrollHeight = 500;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private characterService: CharacterService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.query = params.get('q') || '';
      this.onUrlChange();
      this.getDataFromService();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const yOffSet = window.scrollY;
    if (
      (yOffSet ||
        this.document.documentElement.scrollTop ||
        this.document.body.scrollTop) > this.showScrollHeight
    ) {
      this.showGoUpButton = true;
    } else if (
      this.showGoUpButton &&
      (yOffSet ||
        this.document.documentElement.scrollTop ||
        this.document.body.scrollTop) < this.hideScrollHeight
    ) {
      this.showGoUpButton = false;
    }
  }

  onScrollDown() {
    if (this.info.next) {
      this.pageNum++;
      this.getDataFromService();
    }
  }

  onScrollUp(): void {
    this.document.body.scrollTop = 0; // Safari
    this.document.documentElement.scrollTop = 0; // Outros navegadores
  }

  private onUrlChange(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.characters = [];
        this.pageNum = 1;
        this.getDataFromService();
      });
  }

  private getDataFromService(): void {
    this.characterService
      .searchCharacters(this.query, this.pageNum)
      .pipe(take(1))
      .subscribe((res: any) => {
        const { info, results } = res;
        if (this.pageNum === 1) {
          this.characters = [];
        }
        this.characters = [...this.characters, ...results];
        this.info = info;
      });
  }

  onGoBack(): void {
    this.router.navigate(['/home']);
  }

  getStatusCircleClass(status: string): string {
    switch (status) {
      case 'Dead':
        return 'status-dead';
      case 'Alive':
        return 'status-alive';
      default:
        return 'status-unknown';
    }
  }
}
