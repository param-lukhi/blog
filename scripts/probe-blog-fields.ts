// Print all available select fields for Blog model
const { Prisma } = require('@prisma/client');
const dmmf = (Prisma as any).dmmf;
const blogModel = dmmf.datamodel.models.find((m: any) => m.name === 'Blog');
if (blogModel) {
  console.log('Blog fields:', blogModel.fields.map((f: any) => f.name).join(', '));
} else {
  console.log('Blog model not found in DMMF');
}
