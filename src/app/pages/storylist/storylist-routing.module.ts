import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorylistComponent } from './storylist.component';

const routes: Routes = [{ path: '', component: StorylistComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class StorylistRoutingModule {}
