import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { PanelTemplate } from 'src/modules/panels/domain/template/panel-template.entity';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import { PanelSection } from 'src/modules/panels/domain/panel/panel-section.entity';
import { PanelParameter } from 'src/modules/panels/domain/panel/panel-parameter.entity';
import { ParameterInputTypeEnum } from 'src/modules/panels/domain/panel/enums/parameter-input-type.enum';
import { ITemplateRepository } from 'src/modules/panels/domain/template/interfaces/template.repository.interface';

@Injectable()
export class TemplateRepository implements ITemplateRepository {
  constructor(
    @InjectRepository(PanelTemplate)
    private readonly templateRepo: Repository<PanelTemplate>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(category?: string): Promise<PanelTemplate[]> {
    const where = category ? { category } : {};
    return this.templateRepo.find({
      where,
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findByIds(ids: string[]): Promise<PanelTemplate[]> {
    return this.templateRepo.find({
      where: { id: In(ids) },
    });
  }

  async seedTemplatesForLab(
    labId: string,
    templateIds: string[],
  ): Promise<TestPanel[]> {
    const templates = await this.findByIds(templateIds);

    return this.dataSource.transaction(async (manager) => {
      const createdPanels: TestPanel[] = [];

      for (const template of templates) {
        const panel = manager.create(TestPanel, {
          labId,
          name: template.name,
          category: template.category,
          price: template.defaultPrice,
          sortOrder: 0,
        });

        const savedPanel = await manager.save(panel);

        const sectionsData = template.templateData?.sections || [];
        for (const secData of sectionsData) {
          const section = manager.create(PanelSection, {
            panelId: savedPanel.id,
            name: secData.name,
            sortOrder: secData.sortOrder,
          });

          const savedSection = await manager.save(section);

          for (const paramData of secData.parameters || []) {
            const inputType =
              paramData.inputType === 'TEXT'
                ? ParameterInputTypeEnum.TEXT
                : paramData.inputType === 'DROPDOWN'
                  ? ParameterInputTypeEnum.DROPDOWN
                  : paramData.inputType === 'GRID'
                    ? ParameterInputTypeEnum.GRID
                    : ParameterInputTypeEnum.NUMBER;

            const parameter = manager.create(PanelParameter, {
              sectionId: savedSection.id,
              name: paramData.name,
              nameLocal: paramData.nameLocal ?? null,
              unit: paramData.unit ?? null,
              inputType,
              options: paramData.options ?? null,
              method: paramData.method ?? null,
              normalRange: paramData.normalRange ?? null,
              sortOrder: paramData.sortOrder,
            });

            await manager.save(parameter);
          }
        }

        const fullPanel = await manager.findOneOrFail(TestPanel, {
          where: { id: savedPanel.id },
          relations: {
            sections: {
              parameters: true,
            },
          },
        });

        createdPanels.push(fullPanel);
      }

      return createdPanels;
    });
  }
}
