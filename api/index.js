export default function handler(req, res) {
  res.status(200).json({
    message: 'SupChaissac API is running!',
    timestamp: new Date().toISOString()
  });
}
