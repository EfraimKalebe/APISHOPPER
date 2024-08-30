import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import geminiService from '../services/geminiService';

const measures: any[] = []; // Simples armazenamento em memória para teste

const upload = async (req: Request, res: Response) => {
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  if (!image || !customer_code || !measure_datetime || !['WATER', 'GAS'].includes(measure_type)) {
    return res.status(400).json({ error_code: 'INVALID_DATA', error_description: 'Invalid input data' });
  }

  const existingMeasure = measures.find(
    measure => measure.customer_code === customer_code && new Date(measure.measure_datetime).getMonth() === new Date(measure_datetime).getMonth() && measure.measure_type === measure_type
  );

  if (existingMeasure) {
    return res.status(409).json({ error_code: 'DOUBLE_REPORT', error_description: 'Leitura do mês já realizada' });
  }

  const measureValue = await geminiService.extractValueFromImage(image);
  const measure_uuid = uuidv4();
  const measure = { measure_uuid, customer_code, measure_datetime, measure_type, measureValue, has_confirmed: false, image_url: `https://example.com/images/${measure_uuid}` };

  measures.push(measure);

  return res.status(200).json({ image_url: measure.image_url, measure_value: measureValue, measure_uuid });
};

const confirm = (req: Request, res: Response) => {
  const { measure_uuid, confirmed_value } = req.body;

  const measure = measures.find(measure => measure.measure_uuid === measure_uuid);

  if (!measure) {
    return res.status(404).json({ error_code: 'MEASURE_NOT_FOUND', error_description: 'Leitura não encontrada' });
  }

  if (measure.has_confirmed) {
    return res.status(409).json({ error_code: 'CONFIRMATION_DUPLICATE', error_description: 'Leitura já confirmada' });
  }

  measure.measureValue = confirmed_value;
  measure.has_confirmed = true;

  return res.status(200).json({ success: true });
};

const list = (req: Request, res: Response) => {
  const { customerCode } = req.params;
  const { measure_type } = req.query;

  const customerMeasures = measures.filter(measure => measure.customer_code === customerCode && (!measure_type || measure.measure_type.toUpperCase() === measure_type.toString().toUpperCase()));

  if (customerMeasures.length === 0) {
    return res.status(404).json({ error_code: 'MEASURES_NOT_FOUND', error_description: 'Nenhuma leitura encontrada' });
  }

  return res.status(200).json({ customer_code: customerCode, measures: customerMeasures });
};

export default { upload, confirm, list };
