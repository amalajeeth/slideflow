import React, { useState, useEffect } from "react";
import { Layout, Drawer, Button, Grid, Row, Col, Input, message } from "antd";
import {
  DownloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableNode from "./components/draggableNodes/draggableNodes";
import WorkflowCanvas from "./components/workFlowCanvas/WorkFlowCanvas";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

// Keys for localStorage
const WORKFLOW_STORAGE_KEY = "workflowData";
const DRAGGABLE_NODES_STORAGE_KEY = "draggableNodes";

const App: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const screens = useBreakpoint();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [nodeLabel, setNodeLabel] = useState("");
  const [draggableNodes, setDraggableNodes] = useState<
    { id: string; label: string }[]
  >(() => {
    const savedDraggableNodes = localStorage.getItem(
      DRAGGABLE_NODES_STORAGE_KEY
    );
    return savedDraggableNodes ? JSON.parse(savedDraggableNodes) : [];
  });
  const [workflowData, setWorkflowData] = useState(() => {
    const savedWorkflow = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    return savedWorkflow ? JSON.parse(savedWorkflow) : { nodes: [], edges: [] };
  });


  useEffect(() => {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflowData));
  }, [workflowData]);

  useEffect(() => {
    localStorage.setItem(
      DRAGGABLE_NODES_STORAGE_KEY,
      JSON.stringify(draggableNodes)
    );
  }, [draggableNodes]);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleReset = () => {
    setWorkflowData({ nodes: [], edges: [] });
    setDraggableNodes([]);
    setNodeLabel("");
    setResetKey((prevKey) => prevKey + 1);
    localStorage.removeItem(WORKFLOW_STORAGE_KEY);
    localStorage.removeItem(DRAGGABLE_NODES_STORAGE_KEY);
    messageApi.success("Workflow has been reset!");
  };

  const handleAddNode = () => {
    if (!nodeLabel.trim()) {
      messageApi.warning("Please enter a label for the node!");
      return;
    }
    const newNode = {
      id: `node-${draggableNodes.length + 1}`,
      label: nodeLabel,
    };
    setDraggableNodes((prevNodes) => [...prevNodes, newNode]);
    setNodeLabel("");
    messageApi.success("Node added to the sidebar!");
  };

  const handleDeleteNode = (id: string) => {
    setDraggableNodes((prevNodes) =>
      prevNodes.filter((node) => node.id !== id)
    );
    messageApi.success("Node deleted from the sidebar!");
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
    messageApi.success("Workflow exported successfully!");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string);
        if (workflow.nodes && workflow.edges) {
          const updatedNodes = workflow.nodes.map((node: any) => ({
            ...node,
            position: node.position || { x: 100, y: 100 },
          }));
          setWorkflowData({ nodes: updatedNodes, edges: workflow.edges });
          const importedDraggableNodes = workflow.nodes.map((node: any) => ({
            id: node.id,
            label: node.data?.label || "node",
          }));
          setDraggableNodes(importedDraggableNodes);
          localStorage.setItem(
            WORKFLOW_STORAGE_KEY,
            JSON.stringify({ nodes: updatedNodes, edges: workflow.edges })
          );
          localStorage.setItem(
            DRAGGABLE_NODES_STORAGE_KEY,
            JSON.stringify(importedDraggableNodes)
          );
          messageApi.success("Workflow imported successfully!");
        } else {
          messageApi.error("Invalid workflow file structure!");
        }
      } catch (error) {
        messageApi.error("Failed to parse workflow file!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar for larger screens */}
        {screens.lg ? (
          <Sider
            width={300}
            theme="light"
            style={{ borderRight: "1px solid #f0f0f0", padding: "16px" }}
          >
            <h3>Workflow Tools</h3>
            <Input
              placeholder="Enter node label"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              style={{ marginBottom: "8px" }}
            />
            <Button
              type="primary"
              block
              onClick={handleAddNode}
              style={{ marginBottom: "16px" }}
            >
              Add Node
            </Button>
            <Row gutter={[8, 8]}>
              {draggableNodes.map((node) => (
                <Col span={24} key={node.id}>
                  <DraggableNode
                    id={node.id}
                    label={node.label}
                    onDelete={handleDeleteNode}
                  />
                </Col>
              ))}
            </Row>
            <Button
              type="primary"
              block
              icon={<DownloadOutlined />}
              onClick={handleExport}
              style={{ marginBottom: "8px" }}
            >
              Export Workflow
            </Button>
            <Button
              type="primary"
              block
              icon={<UploadOutlined />}
              style={{ marginBottom: "16px" }}
            >
              <label htmlFor="import-workflow" style={{ cursor: "pointer" }}>
                Import Workflow
              </label>
              <input
                id="import-workflow"
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </Button>
            <Button
              type="primary"
              block
              style={{ marginTop: "16px" }}
              onClick={handleReset}
            >
              Reset Workflow
            </Button>
          </Sider>
        ) : (
          <Drawer
            title="Workflow Tools"
            placement="left"
            closable
            onClose={toggleDrawer}
            open={drawerVisible}
            width={250}
          >
            <Input
              placeholder="Enter node label"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              style={{ marginBottom: "8px" }}
            />
            <Button
              type="primary"
              block
              onClick={handleAddNode}
              style={{ marginBottom: "16px" }}
            >
              Add Node
            </Button>
            <Row gutter={[8, 8]}>
              {draggableNodes.map((node) => (
                <Col span={24} key={node.id}>
                  <DraggableNode
                    id={node.id}
                    label={node.label}
                    onDelete={handleDeleteNode}
                  />
                </Col>
              ))}
            </Row>
            <Button
              type="primary"
              block
              icon={<DownloadOutlined />}
              onClick={handleExport}
              style={{ marginBottom: "8px" }}
            >
              Export Workflow
            </Button>
            <Button
              type="primary"
              block
              icon={<UploadOutlined />}
              style={{ marginBottom: "16px" }}
            >
              <label htmlFor="import-workflow" style={{ cursor: "pointer" }}>
                Import Workflow
              </label>
              <input
                id="import-workflow"
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </Button>
            <Button
              type="primary"
              block
              style={{ marginTop: "16px" }}
              onClick={handleReset}
            >
              Reset Workflow
            </Button>
          </Drawer>
        )}
        <Layout>
          <Content>
            {!screens.lg && (
              <Button
                type="text"
                icon={
                  drawerVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                }
                onClick={toggleDrawer}
                style={{ margin: "16px" }}
              />
            )}
            <WorkflowCanvas
              key={resetKey}
              workflowData={workflowData}
              setWorkflowData={setWorkflowData}
            />
          </Content>
        </Layout>
      </Layout>
    </DndProvider>
  );
};

export default App;
