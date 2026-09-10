import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TestPanel } from 'src/modules/panels/domain/panel/test-panel.entity';
import { PanelSection } from 'src/modules/panels/domain/panel/panel-section.entity';
import { PanelParameter } from 'src/modules/panels/domain/panel/panel-parameter.entity';
import { IPanelRepository } from 'src/modules/panels/domain/panel/interfaces/panel.repository.interface';

@Injectable()
export class PanelRepository implements IPanelRepository {
  constructor(
    @InjectRepository(TestPanel)
    private readonly panelRepo: Repository<TestPanel>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: string, labId: string): Promise<TestPanel | null> {
    return this.panelRepo.findOne({
      where: { id, labId },
      relations: {
        sections: {
          parameters: true,
        },
      },
      order: {
        sections: {
          sortOrder: 'ASC',
          parameters: {
            sortOrder: 'ASC',
          },
        },
      },
    });
  }

  async findByLabId(labId: string, category?: string): Promise<TestPanel[]> {
    const query = this.panelRepo
      .createQueryBuilder('panel')
      .leftJoinAndSelect('panel.sections', 'section')
      .leftJoinAndSelect('section.parameters', 'parameter')
      .where('panel.lab_id = :labId', { labId });

    if (category) {
      query.andWhere('panel.category = :category', { category });
    }

    query
      .orderBy('panel.sort_order', 'ASC')
      .addOrderBy('panel.created_at', 'DESC')
      .addOrderBy('section.sort_order', 'ASC')
      .addOrderBy('parameter.sort_order', 'ASC');

    return query.getMany();
  }

  async saveWithStructure(
    panelData: Partial<TestPanel>,
    sectionsData: any[],
  ): Promise<TestPanel> {
    return this.dataSource.transaction(async (manager) => {
      const panel = manager.create(TestPanel, panelData);
      const savedPanel = await manager.save(panel);

      if (sectionsData && sectionsData.length > 0) {
        for (const secData of sectionsData) {
          const section = manager.create(PanelSection, {
            panelId: savedPanel.id,
            name: secData.name,
            sortOrder: secData.sortOrder ?? 0,
          });
          const savedSection = await manager.save(section);

          if (secData.parameters && secData.parameters.length > 0) {
            for (const paramData of secData.parameters) {
              const parameter = manager.create(PanelParameter, {
                sectionId: savedSection.id,
                name: paramData.name,
                nameLocal: paramData.nameLocal ?? null,
                unit: paramData.unit ?? null,
                inputType: paramData.inputType,
                options: paramData.options ?? null,
                method: paramData.method ?? null,
                normalRange: paramData.normalRange ?? null,
                sortOrder: paramData.sortOrder ?? 0,
              });
              await manager.save(parameter);
            }
          }
        }
      }

      return manager.findOneOrFail(TestPanel, {
        where: { id: savedPanel.id },
        relations: {
          sections: {
            parameters: true,
          },
        },
      });
    });
  }

  async updateWithStructure(
    id: string,
    labId: string,
    updateData: any,
  ): Promise<TestPanel> {
    return this.dataSource.transaction(async (manager) => {
      const panel = await manager.findOne(TestPanel, {
        where: { id, labId },
        relations: { sections: { parameters: true } },
      });

      if (!panel) {
        return null as any;
      }

      if (updateData.name !== undefined) panel.name = updateData.name;
      if (updateData.category !== undefined) panel.category = updateData.category;
      if (updateData.price !== undefined) panel.price = updateData.price;
      if (updateData.sortOrder !== undefined) panel.sortOrder = updateData.sortOrder;

      await manager.save(panel);

      if (updateData.sections !== undefined) {
        if (panel.sections && panel.sections.length > 0) {
          await manager.remove(panel.sections);
        }

        for (const secData of updateData.sections) {
          const section = manager.create(PanelSection, {
            panelId: panel.id,
            name: secData.name,
            sortOrder: secData.sortOrder ?? 0,
          });
          const savedSection = await manager.save(section);

          if (secData.parameters && secData.parameters.length > 0) {
            for (const paramData of secData.parameters) {
              const parameter = manager.create(PanelParameter, {
                sectionId: savedSection.id,
                name: paramData.name,
                nameLocal: paramData.nameLocal ?? null,
                unit: paramData.unit ?? null,
                inputType: paramData.inputType,
                options: paramData.options ?? null,
                method: paramData.method ?? null,
                normalRange: paramData.normalRange ?? null,
                sortOrder: paramData.sortOrder ?? 0,
              });
              await manager.save(parameter);
            }
          }
        }
      }

      return manager.findOneOrFail(TestPanel, {
        where: { id: panel.id },
        relations: { sections: { parameters: true } },
      });
    });
  }

  async delete(id: string, labId: string): Promise<boolean> {
    const result = await this.panelRepo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
