package com.nuance.samples

import com.nuance.liveassist.escalation.*

class TimeBasedEscalationClassifier implements IEscalationClassifier {
  EscalationResult classify(IClassificationParameters params) {
        int hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        if (hour < 9)
            return EscalationResult.DO_NOT_ESCALATE
        if (hour > 17)
            return EscalationResult.DO_NOT_ESCALATE
        return EscalationResult.ESCALATE
  }
}
