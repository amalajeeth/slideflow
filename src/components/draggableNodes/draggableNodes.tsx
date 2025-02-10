import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Card, Button, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface DraggableNodeProps {
  id: string;
  label: string;
  onDelete: (id: string) => void; // Callback to delete the node
}

const DraggableNode: React.FC<DraggableNodeProps> = ({ id, label, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NODE',
    item: { id, label },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null); // Create a ref
  drag(ref);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <Card
        size="small"
        style={{ marginBottom: '8px' }}
        bordered
      >
       <Row align="middle" justify="space-between" style={{ width: '100%' }}>
          <Col>{label}</Col>
          <Col>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(id)}
              style={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
       
      </Card>
    </div>
  );
};

export default DraggableNode;