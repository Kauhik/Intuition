import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  FaUndo,
  FaDownload,
  FaDesktop,
  FaMobile,
  FaCode,
} from "react-icons/fa";
import { AppState, Settings } from "../../types";
import CodeTab from "./CodeTab";
import { Button } from "../ui/button";
import { useAppStore } from "../../store/app-store";
import { useProjectStore } from "../../store/project-store";
import { extractHtml } from "./extractHtml";
import PreviewComponent from "./PreviewComponent";
import { downloadCode } from "./download";

interface Props {
  doUpdate: (instruction: string) => void;
  reset: () => void;
  settings: Settings;
}

function PreviewPane({ doUpdate, reset, settings }: Props) {
  const { appState } = useAppStore();
  const { inputMode, head, commits } = useProjectStore();

  const currentCommit = head && commits[head] ? commits[head] : "";
  const currentCode = currentCommit
    ? currentCommit.variants[currentCommit.selectedVariantIndex].code
    : "";

  const previewCode =
    inputMode === "video" && appState === AppState.CODING
      ? extractHtml(currentCode)
      : currentCode;

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="desktop" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {appState === AppState.CODE_READY && (
              <div className="flex gap-2">
                <Button
                  onClick={reset}
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaUndo className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
                <Button
                  onClick={() => downloadCode(previewCode)}
                  variant="outline"
                  className="flex items-center gap-2 download-btn hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaDownload className="h-4 w-4" /> 
                  <span>Download</span>
                </Button>
              </div>
            )}
          </div>

          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="desktop" 
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <FaDesktop className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger 
              value="mobile"
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <FaMobile className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="code"
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <FaCode className="h-4 w-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="desktop" className="h-full">
            <PreviewComponent
              code={previewCode}
              device="desktop"
              doUpdate={doUpdate}
            />
          </TabsContent>
          <TabsContent value="mobile" className="h-full">
            <PreviewComponent
              code={previewCode}
              device="mobile"
              doUpdate={doUpdate}
            />
          </TabsContent>
          <TabsContent value="code" className="h-full">
            <CodeTab code={previewCode} setCode={() => {}} settings={settings} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default PreviewPane;
