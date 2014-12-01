<%@ page language="java" contentType="text/xml; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE vxml PUBLIC "-//Nuance/DTD VoiceXML 2.0//EN" "http://voicexml.nuance.com/dtd/nuancevoicexml-2-0.dtd">
<vxml version="2.0">
    <meta http-equiv="Cache-Control" content="no-cache"/>
    <var name="varName" expr="'Travel'"/>
    <var name="varVersion" expr="'1.0'"/>
    <var name="ani" expr="session.connection.remote.uri"/>
    <var name="dnis" expr="session.connection.local.uri"/>
    <var name="externalSessionID" expr="session.connection.sessionid"/>
    <var name="canStreamAudio" expr="true"/>
    <data name="laStartSession" src="${apiPath}/startSession" method="post" namelist="varName varVersion ani dnis externalSessionID canStreamAudio" syntax="e4x"/>
    <var name="sessionID" expr="'' + laStartSession.sessionID"/>
    <catch event="connection.disconnect">
        <if cond="sessionID != ''">
            <data name="laCancelInteraction" src="${apiPath}/cancelInteraction" method="post" namelist="sessionID" syntax="e4x"/>
            <exit/>
        </if>
    </catch>
    <catch event="nuance.sessionended">
        <if cond="sessionID != ''">
            <data name="laEndSession" src="${apiPath}/endSession" method="post" namelist="sessionID" syntax="e4x"/>
        </if>
    </catch>
    <form>
        <property name="recordutterance" value="true"/>
        <var name="viewName" expr="'travelview.jsp'"/>
        <var name="variableNames" expr="'originCity|destinationCity|departureDay'"/>
        <data name="laStartInteraction" src="${apiPath}/startInteraction" method="post" namelist="sessionID viewName variableNames" syntax="e4x"/>
        <var name="interactionID" expr="'' + laStartInteraction.interactionID"/>
        <var name="laState" expr="'start'"/>
        <link event="dtmf">
            <grammar mode="dtmf" root="dtmf_operator">
                <rule id="dtmf_operator" scope="public">
                    <one-of>
                        <item>0</item>
                    </one-of>
                </rule>
            </grammar>
        </link>
        <catch event="dtmf">
            <data name="laCancelInteraction" src="${apiPath}/cancelInteraction" method="post" namelist="sessionID" syntax="e4x"/>
            <prompt>
                The interaction was cancelled. Transferring you to the operator.
            </prompt>
            <exit/>
        </catch>
        <field name="travelField">
            <property name="swirec.liveassist.interaction" expr="interactionID"/>
            <grammar src="${contentPath}/travel/travel.grxml"/>
            <prompt cond="laState == 'start'">
                Hello, welcome to ACME Airlines.
                What are your travel plans today? For example you can say from Boston to Austin on Tuesday.
            </prompt>
            <filled>
                <var name="recognitionResult" expr="'' + lastresult$.emmatext"/>
                <var name="utterance" expr="'' + lastresult$.recording"/>
                <data name="laSendInteractionResult" src="${apiPath}/sendInteractionResult" method="post" namelist="sessionID recognitionResult utterance" syntax="e4x"/>
                <data name="laGetLiveAssistResult" src="${apiPath}/getLiveAssistResult" method="post" namelist="sessionID" syntax="e4x"/>
                <assign name="laState" expr="laGetLiveAssistResult.state"/>
                <if cond="laState == 'agentFilled'">
                    <var name="originCity" expr="laGetLiveAssistResult.outcomeValues[0]"/>
                    <var name="destinationCity" expr="laGetLiveAssistResult.outcomeValues[1]"/>
                    <var name="departureDay" expr="laGetLiveAssistResult.outcomeValues[2]"/>
                    <prompt>
                        Ok I got it with agent's help.
                        You wan't to fly from 
                        <value expr="originCity"/>
                        to
                        <value expr="destinationCity"/>
                        on
                        <value expr="departureDay"/>
                    </prompt>
                    <exit/>
                <elseif cond="laState == 'agentPending'"/>
                    <prompt timeout="2s">
                        Just a second...
                    </prompt>
                    <clear namelist="travelField"/>
                <else/>
                    <var name="originCity" expr="lastresult$.interpretation.originCity"/>
                    <var name="destinationCity" expr="lastresult$.interpretation.destinationCity"/>
                    <var name="departureDay" expr="lastresult$.interpretation.departureDay"/>
                    <prompt>
                        Ok got it.
                        You wan't to fly from 
                        <value expr="originCity"/>
                        to
                        <value expr="destinationCity"/>
                        on
                        <value expr="departureDay"/>
                    </prompt>
                    <exit/>
                </if>
            </filled>
            <noinput>
                <data name="laGetLiveAssistResult" src="${apiPath}/getLiveAssistResult" method="post" namelist="sessionID" syntax="e4x"/>
                <assign name="laState" expr="laGetLiveAssistResult.state"/>
                <if cond="laState == 'agentFilled'">
                    <var name="originCity" expr="laGetLiveAssistResult.outcomeValues[0]"/>
                    <var name="destinationCity" expr="laGetLiveAssistResult.outcomeValues[1]"/>
                    <var name="departureDay" expr="laGetLiveAssistResult.outcomeValues[2]"/>
                    <prompt>
                        Ok I got it with agent's help.
                        You wan't to fly from 
                        <value expr="originCity"/>
                        to
                        <value expr="destinationCity"/>
                        on
                        <value expr="departureDay"/>
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
                <var name="recognitionResult" expr="'' + lastresult$.emmatext"/>
                <var name="utterance" expr="'' + lastresult$.recording"/>
                <data name="laSendInteractionResult" src="${apiPath}/sendInteractionResult" method="post" namelist="sessionID recognitionResult utterance" syntax="e4x"/>
                <data name="laGetLiveAssistResult" src="${apiPath}/getLiveAssistResult" method="post" namelist="sessionID" syntax="e4x"/>
                <assign name="laState" expr="laGetLiveAssistResult.state"/>
                <if cond="laState == 'agentFilled'">
                    <var name="originCity" expr="laGetLiveAssistResult.outcomeValues[0]"/>
                    <var name="destinationCity" expr="laGetLiveAssistResult.outcomeValues[1]"/>
                    <var name="departureDay" expr="laGetLiveAssistResult.outcomeValues[2]"/>
                    <prompt>
                        Ok I got it with agent's help.
                        You wan't to fly from 
                        <value expr="originCity"/>
                        to
                        <value expr="destinationCity"/>
                        on
                        <value expr="departureDay"/>
                     </prompt>
                     <exit/>
                <elseif cond="laState == 'agentPending'"/>
                    <prompt timeout="2s">
                        Just a second...
                    </prompt>                
                <else/> <!-- notEscalated -->
                    <prompt>
                        I had trouble with that.
                    </prompt>
                </if>
            </nomatch>
        </field>
    </form>
</vxml>
