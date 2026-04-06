import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { format } from 'date-fns';

export const reportService = {
  /**
   * Generates a PDF report from triage result data
   */
  async generateReport(result, patientProfile) {
    const dateStr = format(new Date(result.created_at || new Date()), 'PPP');
    
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #0F172A; }
            .header { border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { color: #2563EB; font-size: 24px; font-weight: bold; }
            .title { font-size: 28px; font-weight: bold; margin-top: 10px; }
            .meta { color: #64748B; font-size: 14px; margin-top: 5px; }
            
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #1E293B; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            
            .risk-box { padding: 20px; border-radius: 12px; margin-bottom: 20px; }
            .risk-HIGH { background-color: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
            .risk-MEDIUM { background-color: #FFFBEB; border: 1px solid #FDE68A; color: #D97706; }
            .risk-LOW { background-color: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; }
            
            .risk-label { font-weight: bold; font-size: 20px; }
            .risk-summary { font-size: 16px; margin-top: 8px; }
            
            .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #F8FAFC; padding: 15px; border-radius: 8px; }
            .patient-item { margin-bottom: 10px; }
            .patient-label { color: #64748B; font-size: 12px; text-transform: uppercase; }
            .patient-value { font-weight: 500; }
            
            .symptom-chips { display: flex; flex-wrap: wrap; gap: 8px; }
            .chip { padding: 6px 12px; background: #EEF2FF; border-radius: 20px; font-size: 13px; color: #4338CA; }
            
            .recommendation { background: #F0F9FF; border-left: 4px solid #0EA5E9; padding: 15px; border-radius: 4px; }
            
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">MediTriage AI</div>
            <div class="title">Medical Triage Report</div>
            <div class="meta">Generated on ${dateStr} • ID: ${result.id?.substring(0, 8)}</div>
          </div>

          <div class="section">
            <div class="section-title">Risk Assessment</div>
            <div class="risk-box risk-${result.risk_level}">
              <div class="risk-label">${result.risk_level} RISK</div>
              <div class="risk-summary">${result.ai_summary}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Patient Profile</div>
            <div class="patient-grid">
              <div class="patient-item">
                <div class="patient-label">Name</div>
                <div class="patient-value">${patientProfile.full_name}</div>
              </div>
              <div class="patient-item">
                <div class="patient-label">Age / Gender</div>
                <div class="patient-value">${patientProfile.age}y / ${patientProfile.gender}</div>
              </div>
              <div class="patient-item">
                <div class="patient-label">Chronic Conditions</div>
                <div class="patient-value">${patientProfile.chronic_conditions || 'None'}</div>
              </div>
              <div class="patient-item">
                <div class="patient-label">Allergies</div>
                <div class="patient-value">${patientProfile.allergies || 'None'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Detected Symptoms</div>
            <div class="symptom-chips">
              ${result.detected_symptoms?.map(s => `<span class="chip">${s}</span>`).join('') || 'None identified'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">AI Recommendation</div>
            <div class="recommendation">
              ${result.ai_recommendation}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Medical Explanation</div>
            <div style="line-height: 1.6; color: #334155;">
              ${result.ai_explanation}
            </div>
          </div>

          <div class="footer">
            This report was generated by MediTriage AI. It is intended for informational purposes and should be reviewed by a medical professional.
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  },

  /**
   * Generates and shares a PDF report
   */
  async shareReport(result, patientProfile) {
    try {
      const uri = await this.generateReport(result, patientProfile);
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `MediTriage Report - ${patientProfile.full_name}`,
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      throw error;
    }
  }
};
