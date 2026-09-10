import { PanelTemplate } from '../panel-template.entity';
import { TestPanel } from '../../panel/test-panel.entity';

export const TEMPLATE_REPOSITORY_TOKEN = Symbol('ITemplateRepository');

export interface ITemplateRepository {
  findAll(category?: string): Promise<PanelTemplate[]>;
  findByIds(ids: string[]): Promise<PanelTemplate[]>;
  seedTemplatesForLab(labId: string, templateIds: string[]): Promise<TestPanel[]>;
}
