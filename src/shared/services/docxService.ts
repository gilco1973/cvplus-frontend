import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { Job } from './cvService';

export class DOCXService {
  static async generateDOCXFromJob(job: Job): Promise<Blob> {
    const cv = job.parsedData;
    if (!cv) throw new Error('No CV data available');

    const sections = [];

    // Header with name and contact info
    sections.push(
      new Paragraph({
        text: cv.personalInfo?.name || '',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    // Contact information
    const contactInfo = [];
    if (cv.personalInfo?.email) contactInfo.push(cv.personalInfo.email);
    if (cv.personalInfo?.phone) contactInfo.push(cv.personalInfo.phone);
    if (cv.personalInfo?.location) contactInfo.push(cv.personalInfo.location);
    
    if (contactInfo.length > 0) {
      sections.push(
        new Paragraph({
          text: contactInfo.join(' • '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Professional Summary
    if (cv.summary) {
      sections.push(
        new Paragraph({
          text: 'Professional Summary',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: cv.summary,
          spacing: { after: 400 },
        })
      );
    }

    // Experience
    if (cv.experience && cv.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Experience',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      cv.experience.forEach((exp: any) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.position,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: ` • ${exp.duration}`,
                size: 22,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: exp.company,
                italics: true,
              }),
            ],
            spacing: { after: 100 },
          })
        );

        if (exp.description) {
          sections.push(
            new Paragraph({
              text: exp.description,
              spacing: { after: 100 },
            })
          );
        }

        if (exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0) {
          exp.achievements.forEach((achievement: string) => {
            sections.push(
              new Paragraph({
                text: `• ${achievement}`,
                indent: { left: 400 },
                spacing: { after: 50 },
              })
            );
          });
        }

        sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
      });
    }

    // Education
    if (cv.education && cv.education.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Education',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      cv.education.forEach((edu: any) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu?.degree || 'Degree'}${edu?.field && edu.field !== 'undefined' ? ` in ${edu.field}` : ''}`,
                bold: true,
                size: 24,
              }),
              new TextRun({
                text: ` • ${edu?.graduationDate || ''}`,
                size: 22,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: edu?.institution || 'Institution',
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      });
    }

    // Skills
    if (cv.skills) {
      sections.push(
        new Paragraph({
          text: 'Skills',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      if (cv.skills.technical && cv.skills.technical.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Technical Skills: ',
                bold: true,
              }),
              new TextRun({
                text: cv.skills.technical.join(', '),
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (cv.skills.soft && cv.skills.soft.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Soft Skills: ',
                bold: true,
              }),
              new TextRun({
                text: cv.skills.soft.join(', '),
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections,
      }],
    });

    // Generate blob
    const blob = await Packer.toBlob(doc);
    return blob;
  }

  static downloadDOCX(blob: Blob, fileName = 'cv.docx') {
    saveAs(blob, fileName);
  }
}