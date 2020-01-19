import { Component, OnInit } from "@angular/core";
import { RouterService } from "src/app/shared/router/router.service";
import { HttpService } from "src/app/shared/api/http-service/http.service";
import {
  StoryApiService,
  IBoardUpdate
} from "src/app/stories/services/story-api.service";
import { BoardApiService } from "../../services/board-api/board-api.service";
import { IBoard } from "../../interfaces/board.interface";
import { BoardRefreshService } from "../../services/board-refresh/board-refresh.service";
import { IStory } from "src/app/stories/interfaces/story.interface";

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"]
})
export class BoardComponent implements OnInit {
  public board: IBoard;
  private _boardId: string;

  constructor(
    private readonly _routerService: RouterService,
    private readonly _httpService: HttpService,
    private readonly _storyApiService: StoryApiService,
    private readonly _boardApiService: BoardApiService,
    private readonly _boardRefreshService: BoardRefreshService
  ) {}

  ngOnInit() {
    this._fetchBoard();
    this._subscribeToNewStories();
    this._subscribeToDeletedStories();
    this._onBoardRefresh();
  }

  public addColumn(title: string) {
    this.board.columns.push({ title });
    this._saveBoardAndRefresh();
  }

  public async saveBoard() {
    await this._httpService.put(`boards/${this._boardId}`, this.board);
  }

  //! Deprecated until future use - drag drop columns
  // public drop(event: CdkDragDrop<IColumn>): void {
  //   console.log(event);
  //   if (event.currentIndex === event.previousIndex) {
  //     return;
  //   }

  //   moveItemInArray(
  //     this.board.columns,
  //     event.previousIndex,
  //     event.currentIndex
  //   );

  //   this.saveBoard();
  // }

  private _onBoardRefresh(): void {
    this._boardRefreshService.boardListRefresh.subscribe(() => {
      this._fetchBoard(this._boardId);
    });
  }

  private async _saveBoardAndRefresh() {
    await this.saveBoard();
    this._fetchBoard(this._boardId);
  }

  private async _fetchBoard(boardId?: string) {
    if (!boardId) {
      this._boardId = this._routerService.getUrlParams("boardId");
    }
    this.board = await this._boardApiService.fetchBoard(this._boardId);
  }

  private _subscribeToNewStories(): void {
    this._storyApiService.updateBoardSubject.subscribe((val: IBoardUpdate) => {
      const col = this.board.columns.find(col => col._id === val.columnId);
      col.stories.push(val.storyId);
      this._saveBoardAndRefresh();
    });
  }

  private _subscribeToDeletedStories(): void {
    this._storyApiService.deleteStorySubject.subscribe((val: IBoardUpdate) => {
      const col = this.board.columns.find(col => col._id === val.columnId);

      col.stories = col.stories.filter((story: IStory) => {
        return story._id !== val.storyId;
      });

      this._saveBoardAndRefresh();
    });
  }
}
