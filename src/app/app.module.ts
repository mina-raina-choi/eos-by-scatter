import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';


import { AppComponent } from './app.component';
import { ScatterService } from './services/scatter.service';
import { EosService } from './services/eos.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    ScatterService,
    EosService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
