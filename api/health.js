export default async function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    service: 'CareerCast Email Service',
    time: new Date().toISOString(),
  });
}
