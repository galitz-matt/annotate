import { open } from "@tauri-apps/plugin-dialog";

export type PdfPickerProps = {
    value: string | null;
    onChange: (path: string | null) => void;
}

export function PdfPicker({
    value,
    onChange
}: PdfPickerProps) {

    async function pickPDF() {
        const pdfPath = await open({
            multiple: false,
            directory: false,
            filters: [
                {
                    "name": "PDF",
                    "extensions": ["pdf"]
                }
            ]
        })

        if (pdfPath !== null) {
            onChange(pdfPath);     
        }
    }

    return (
        <div>
            <input 
                value={value ?? ""} 
                readOnly 
                placeholder="Choose a file..."
            />
            <button type="button" onClick={pickPDF}>
                Browse
            </button>
        </div>
    );
}