const trackConsent = (req, res, next) => {
  const { hasConsented } = req.body;

  if (!hasConsented) {
    return res.status(451).json({ 
      error: "Legal Consent Required",
      message: "You must accept the Medical Disclaimer and Privacy Policy to proceed." 
    });
  }

  // Attach consent metadata to the request for the DB
  req.consentLog = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    version: "v1.0-2026"
  };
  
  next();
};

module.exports = { trackConsent };
