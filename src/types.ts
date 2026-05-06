/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TechItem {
  id: string;
  name: string;
  category: string;
  description: string;
  justification: {
    scalability: string;
    decoupling: string;
    performance: string;
  };
  icon: string;
}

export interface ModuleItem {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  entities: string[];
  type: 'ingesta' | 'broker' | 'reactivo' | 'datos' | 'interfaz' | 'gestión';
}

export interface FlowStep {
  id: number;
  title: string;
  description: string;
  details: string;
  type: 'async' | 'sync';
}
