import { TestPanel } from '../test-panel.entity';

export const PANEL_REPOSITORY_TOKEN = Symbol('IPanelRepository');

export interface IPanelRepository {
  findById(id: string, labId: string): Promise<TestPanel | null>;
  findByLabId(labId: string, category?: string): Promise<TestPanel[]>;
  saveWithStructure(panelData: Partial<TestPanel>, sectionsData: any[]): Promise<TestPanel>;
  updateWithStructure(id: string, labId: string, updateData: any): Promise<TestPanel>;
  delete(id: string, labId: string): Promise<boolean>;
}
