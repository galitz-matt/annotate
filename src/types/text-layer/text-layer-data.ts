import { PageViewport } from "pdfjs-dist";
import { TextItem, TextStyle } from "pdfjs-dist/types/src/display/api";

export type TextLayerData = {
    items: TextItem[];
    styles: { [x: string]: TextStyle };
    viewport: PageViewport;
}