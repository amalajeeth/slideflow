import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  Connection,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useDrop } from "react-dnd";
import { Button, message } from "antd";
import CustomNode from "../customNode/customNode";

const nodeTypes = {
  custom: CustomNode,
};

const WorkflowCanvas: React.FC<{
  workflowData: { nodes: Node[]; edges: any[] };
  setWorkflowData: (data:any) => void;
}> = ({ workflowData, setWorkflowData }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  
  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params)) {
        setWorkflowData((prev: { nodes: Node[]; edges: any[] }) => ({
          ...prev,
          edges: addEdge(params, prev.edges),
        }));
      }
    },
    []
  );

  const isValidConnection = useCallback(
    (connection: Connection) => {
      const { source, target } = connection;
  
      const sourceNode = workflowData.nodes.find((node) => node.id === source);
      const targetNode = workflowData.nodes.find((node) => node.id === target);
  
      if (sourceNode?.data.label === targetNode?.data.label) {
        messageApi.warning("Cannot connect nodes with the same label!");
        return false;
      }
  
      const isDuplicate = workflowData.edges.some(
        (edge) => edge.source === source && edge.target === target
      );
      if (isDuplicate) {
        messageApi.warning("Connection already exists!");
        return false;
      }
  
      const isCircular = (source: string, target: string): boolean => {
        const visited = new Set<string>();
        const stack = [target];
        while (stack.length > 0) {
          const current = stack.pop()!;
          if (current === source) return true; // Cycle detected
          if (!visited.has(current)) {
            visited.add(current);
            workflowData.edges
              .filter((edge) => edge.source === current)
              .forEach((edge) => stack.push(edge.target));
          }
        }
        return false;
      };
  
      if (isCircular(source || "", target || "")) {
        messageApi.error("This connection would create a circular dependency!");
        return false;
      }
  
      return true;
    },
    [workflowData.nodes, workflowData.edges]
  );

  //Drop
  const [, drop] = useDrop<{ id: string; label: string }, unknown, unknown>({
    accept: "NODE",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        const newNode = {
          id: `${item.id}-${workflowData.nodes.length + 1}`,
          type: "custom",
          position: { x: offset.x - 100, y: offset.y - 100 }, // Adjust offset as needed
          data: { label: item.label },
        };
        setWorkflowData((prev:any) => ({
          ...prev,
          nodes: [...prev.nodes, newNode],
        }));
      }
    },
  });

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setSelectedNode(node.id);
      setSelectedEdge(null);
      messageApi.info(`Right-clicked node: ${node.data.label}`);
    },
    []
  );
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: any) => {
      event.preventDefault();
      setSelectedEdge(edge.id);
      setSelectedNode(null); // Clear selected node
      messageApi.info("Right-clicked edge");
    },
    []
  );

  //Delete 
  const handleDelete = useCallback(() => {
    if (selectedNode) {
      setWorkflowData((prev:any) => ({
        ...prev,
        nodes: prev.nodes.filter((node:any) => node.id !== selectedNode),
        edges: prev.edges.filter(
          (edge:any) => edge.source !== selectedNode && edge.target !== selectedNode
        ),
      }));
      messageApi.success("Node deleted!");
    } else if (selectedEdge) {
      setWorkflowData((prev:any) => ({
        ...prev,
        edges: prev.edges.filter((edge:any) => edge.id !== selectedEdge),
      }));
      messageApi.success("Connection deleted!");
    }
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [selectedNode, selectedEdge]);

  drop(ref);

  return (
    <div ref={ref} style={{ width: "100%", height: "calc(100vh - 64px)" }}>
      {contextHolder}
      <ReactFlow
        nodes={workflowData.nodes}
        edges={workflowData.edges}
        onNodesChange={(changes) =>
          setWorkflowData((prev:any) => ({
            ...prev,
            nodes: applyNodeChanges(changes, prev.nodes),
          }))
        }
        onEdgesChange={(changes) =>
          setWorkflowData((prev:any) => ({
            ...prev,
            edges: applyEdgeChanges(changes, prev.edges),
          }))
        }
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        onNodeContextMenu={onNodeContextMenu} 
        onEdgeContextMenu={onEdgeContextMenu}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      {/* Delete Button */}
      {(selectedNode || selectedEdge) && (
        <Button
          type="primary"
          danger
          style={{ position: "absolute", top: "16px", right: "16px" }}
          onClick={handleDelete}
        >
          Delete {selectedNode ? "Node" : "Connection"}
        </Button>
      )}
    </div>
  );
};

export default WorkflowCanvas;