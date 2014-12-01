<%@ page language="java" contentType="text/xml; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE vxml PUBLIC "-//Nuance/DTD VoiceXML 2.0//EN" "http://voicexml.nuance.com/dtd/nuancevoicexml-2-0.dtd">
<vxml version="2.0">
    <meta http-equiv="Cache-Control" content="no-cache"/>
    <var name="ani" expr="session.connection.remote.uri"/>
    <var name="dnis" expr="session.connection.local.uri"/>
    <var name="externalSessionID" expr="session.connection.sessionid"/>
    <var name="sessionID" expr="''"/>
    <script>
        <![CDATA[
        var months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
        function getMonthText(month) {
            var monthText = "";
            var tokens = month.split('-');
            var y = tokens[0];
            if (y) {
                var m = tokens[1];
                if (m && m > 0 && m <= months.length) {
                    monthText += months[m - 1] + " ";
                }
                monthText += y;
            }
            if (monthText == "") {
                monthText = month;
            }
            return monthText;
        }
        function getDateText(date) {
            var dateText = "";
            var tokens = date.split('-');
            var y = tokens[0];
            if (y) {
                var m = tokens[1];
                if (m && m >= 1 && m <= months.length) {
                    dateText += months[m - 1];
                    dateText += " ";
                    var d = tokens[2];
                    if (d && d >= 1 && d <= 31) {
                        dateText += d;
                        dateText += " ";
                    }
                }
                dateText += y;
            }
            if (dateText == "") {
                dateText = date;
            }
            return dateText;
        }
        function getTimeText(v) {
            var timeText = "";
            var tokens = v.split(':');
            var h = tokens[0];
            var amorpm = "am";
            if (h) {
                if (h == 0) {
                    timeText += 12;
                    amorpm = "am";
                } else if (h < 12) {
                    timeText += h;
                    amorpm = "am";
                } else if (h == 12) {
                    timeText += h;
                    amorpm = "pm";
                } else {
                    timeText += (h - 12);
                    amorpm = "pm";
                }
                timeText += " ";
                var m = tokens[1];
                if (m && m != "00") {
                    var c = m.charAt(0);
                    if (c == '0') {
                        timeText += "o";
                        timeText += " ";
                        timeText += m.charAt(1);
                    } else {
                        timeText += m;
                        timeText += " ";
                    }
                }
                timeText += amorpm;
            }
            if (timeText == "") {
                timeText = v;
            }
            return timeText;
        }
        function getPhoneText(v) {
            var timeText = '<say-as interpret-as="spell" format="alphanumeric">' + v + '</say-as>';
            return timeText;
        }
        function getVariableFromId(outcome, id) {
            if (outcome.variables) { 
                for each(var variable in outcome.variables) {
                    if (variable.id == id) {
                        return variable.value;
                    }
                }
            }
            return null;
        }
        function getOutcomeText(outcome) {
            var outcomeText = "";
            var intent = outcome.intent.value;
            if (intent == "WAIVE_FEE_REQUEST") {
                outcomeText += "You want to wave a fee.";
                var v = getVariableFromId(outcome, "BILLING_MONTH");
                if (v) {
                    outcomeText += "For " + getMonthText(v) + ".";
                }
                v = getVariableFromId(outcome, "LATE_PAYMENT_REASON");
                if (v) {
                    outcomeText += "Because " + v + ".";
                }
            } else if (intent == "EXPLAIN_FEE_REQUEST") {
                outcomeText += "You want a fee explanation.";
            } else if (intent == "CHECK_BALANCE") {
                outcomeText += "You want to check your balance.";
            } else if (intent == "EXPLAIN_BALANCE") {
                outcomeText += "You want a balance explanation.";
            } else if (intent == "UPDATE_CONTACT_INFORMATION") {
                outcomeText += "You want to update your contact information.";
                var v = getVariableFromId(outcome, "FIRST_NAME");
                if (v) {
                    outcomeText += "First name " + v + ". ";
                }
                v = getVariableFromId(outcome, "LAST_NAME")
                if (v) {
                    outcomeText += "Last name " + v + ". ";
                }
                v = getVariableFromId(outcome, "NEW_ADDRESS")
                if (v) {
                    outcomeText += "New address " + v + ". ";
                }
                v = getVariableFromId(outcome, "NEW_PHONE_NUMBER")
                if (v) {
                    outcomeText += "New phone number " + getPhoneText(v) + ". ";
                }
                v = getVariableFromId(outcome, "NEW_EMAIL")
                if (v) {
                    outcomeText += "New email " + v + ". ";
                }
            } else if (intent == "BOOK_FLIGHT") {
                outcomeText += "You want to book a flight.";
                var v = getVariableFromId(outcome, "DEPARTURE_CITY");
                if (v) {
                    outcomeText += "From " + v + ".";
                }
                v = getVariableFromId(outcome, "ARRIVAL_CITY");
                if (v) {
                    outcomeText += "To " + v + ".";
                }
                v = getVariableFromId(outcome, "DEPARTURE_DAY");
                if (v) {
                    outcomeText += "On " + getDateText(v) + ".";
                }
                v = getVariableFromId(outcome, "DEPARTURE_TIME");
                if (v) {
                    outcomeText += "At " + getTimeText(v) + ".";
                }
            } else if (intent == "OPERATOR") {
                outcomeText += "You asked for the operator.";
            }
            return outcomeText;
        }
        ]]>
    </script>
    <catch event="connection.disconnect">
        <exit/>
    </catch>
    <catch event="nuance.sessionended">
        <if cond="sessionID != ''">
            <data name="laEndSession" src="${apiPath}/endSession" method="post" namelist="sessionID" syntax="e4x"/>
        </if>
    </catch>
    <form>
        <property name="recordutterance" value="true"/>
        <var name="configurationName" expr="'mainmenu'"/>
        <var name="laState" expr="'start'"/>
        <link event="dtmf">
            <grammar src="${contentPath}/operator.grxml"/>
        </link>
        <catch event="dtmf">
            <prompt>
                Transferring you to the operator.
            </prompt>
            <exit/>
        </catch>
        <field name="callSteeringField">
            <grammar src="${contentPath}/mainmenu.grxml"/>
            <prompt cond="laState == 'start'">
                Hello, welcome to the call steering demo.
                If you briefly tell me why you are calling I'll try to help you immediately.
            </prompt>
            <filled>
                <var name="completionCause" expr="'success'"/>
                <var name="recognitionResult" expr="'' + lastresult$.emmatext"/>
                <var name="utterance" expr="'' + lastresult$.recording"/>
                <data name="laInputInteractionStep" src="${apiPath}/inputInteractionStep" method="post" namelist="ani dnis externalSessionID sessionID configurationName completionCause recognitionResult utterance" syntax="e4x"/>
                <assign name="sessionID" expr="'' + laInputInteractionStep.sessionID"/>
                <assign name="laState" expr="laInputInteractionStep.state"/>
                <if cond="laState == 'useLiveAssistResult'">
                    <var name="outcomeText" expr="getOutcomeText(laInputInteractionStep.outcome)"/>
                    <prompt>
                        Ok I got it with agent's help.
                        <value treatasmarkup="true" expr="outcomeText"/>
                    </prompt>
                    <exit/>
                <elseif cond="laState == 'agentPending'"/>
                    <prompt timeout="2s">
                        <audio src="${contentPath}/ticktickticklow.wav"/>
                    </prompt>
                    <clear namelist="callSteeringField"/>
                <else/>
                    <var name="intent" expr="lastresult$.interpretation.INTENT"/>
                    <prompt>
                        Ok got it.
                        You wan't
                        <value expr="intent"/>.
                    </prompt>
                    <exit/>
                </if>
            </filled>
            <noinput>
                <var name="completionCause" expr="'no-input-timeout'"/>
                <data name="laInputInteractionStep" src="${apiPath}/inputInteractionStep" method="post" namelist="ani dnis externalSessionID sessionID configurationName completionCause" syntax="e4x"/>
                <assign name="sessionID" expr="'' + laInputInteractionStep.sessionID"/>
                <assign name="laState" expr="laInputInteractionStep.state"/>
                <if cond="laState == 'useLiveAssistResult'">
                    <var name="outcomeText" expr="getOutcomeText(laInputInteractionStep.outcome)"/>
                    <prompt>
                        Ok I got it with agent's help.
                        <value treatasmarkup="true" expr="outcomeText"/>
                    </prompt>
                    <exit/>
                <elseif cond="laState == 'agentPending'"/>
                    <prompt timeout="2s">

                    </prompt>                
                <else/>
                    <prompt>
                        I didn't hear anything
                    </prompt>
                </if>
            </noinput>
            <nomatch>
                <var name="completionCause" expr="'no-match'"/>
                <var name="recognitionResult" expr="'' + lastresult$.emmatext"/>
                <var name="utterance" expr="'' + lastresult$.recording"/>
                <data name="laInputInteractionStep" src="${apiPath}/inputInteractionStep" method="post" namelist="ani dnis externalSessionID sessionID configurationName completionCause recognitionResult utterance" syntax="e4x"/>
                <assign name="sessionID" expr="'' + laInputInteractionStep.sessionID"/>
                <assign name="laState" expr="laInputInteractionStep.state"/>
                <if cond="laState == 'useLiveAssistResult'">
                    <var name="outcomeText" expr="getOutcomeText(laInputInteractionStep.outcome)"/>
                    <prompt>
                        Ok I got it with agent's help.
                        <value treatasmarkup="true" expr="outcomeText"/>
                    </prompt>
                    <exit/>
                <elseif cond="laState == 'agentPending'"/>
                    <prompt timeout="2s">
                        <audio src="${contentPath}/ticktickticklow.wav"/>
                    </prompt>                
                <else/>
                    <prompt>
                        I had trouble with that.
                    </prompt>
                    <prompt>
                        Maybe a little differently, like i would like to wave a fee, 
                        or i would like to check my balance. 
                        So tell me, what's the reason for your call?.
                    </prompt>
                </if>
            </nomatch>
        </field>
    </form>
</vxml>

