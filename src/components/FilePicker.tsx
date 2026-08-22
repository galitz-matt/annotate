import { open } from "@tauri-apps/plugin-dialog";

export type FilePickerProps = {
    value: string | null;
    onChange: (path: string | null) => void;
}

export function FilePicker({
    value,
    onChange
}: FilePickerProps) {

    async function pickFile() {
        const path = await open({
            multiple: false,
            directory: false,
            filters: [
                {
                    "name": "PDF",
                    "extensions": ["pdf"]
                }
            ]
        })

        if (path !== null) {
            onChange(path);     
        }
    }

    return (
        <div>
            <input 
                value={value ?? ""} 
                readOnly 
                placeholder="Choose a file..."
            />
            <button type="button" onClick={pickFile}>
                Browse
            </button>
        </div>
    );
}