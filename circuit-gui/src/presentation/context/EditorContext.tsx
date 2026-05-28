/**
 * 编辑器上下文
 * 提供编辑器实例的共享访问
 */

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode
} from 'react';
import {
  EditorService,
  ToolManager,
  EventEmitter,
  UndoRedoManager,
  SelectTool,
  ToolType
} from '../..';
import { useEditorStore } from '../hooks/useEditorStore';

interface EditorContextType {
  editorService: EditorService;
  toolManager: ToolManager;
  eventEmitter: EventEmitter;
  undoRedoManager: UndoRedoManager;
}

const EditorContext = createContext<EditorContextType | null>(null);

interface EditorProviderProps {
  children: ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  const instancesRef = useRef<EditorContextType | null>(null);
  const storeSetters = useEditorStore((state) => ({
    setEditorService: state.setEditorService,
    setToolManager: state.setToolManager,
    setEventEmitter: state.setEventEmitter,
    setUndoRedoManager: state.setUndoRedoManager
  }));

  if (!instancesRef.current) {
    const eventEmitter = new EventEmitter();
    const undoRedoManager = new UndoRedoManager();
    const editorService = new EditorService(eventEmitter, undoRedoManager);
    const toolManager = new ToolManager();

    const selectTool = new SelectTool();
    toolManager.registerTool(selectTool);
    toolManager.activateTool(ToolType.SELECT);

    editorService.createNewCircuit('Untitled Circuit');

    instancesRef.current = {
      editorService,
      toolManager,
      eventEmitter,
      undoRedoManager
    };
  }

  const instances = instancesRef.current;

  useEffect(() => {
    storeSetters.setEditorService(instances.editorService);
    storeSetters.setToolManager(instances.toolManager);
    storeSetters.setEventEmitter(instances.eventEmitter);
    storeSetters.setUndoRedoManager(instances.undoRedoManager);

    const circuit = instances.editorService.getCircuit();
    if (circuit) {
      useEditorStore.setState({ circuit });
    }
  }, []);

  return (
    <EditorContext.Provider value={instances}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
