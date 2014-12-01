<%@ page language="java" contentType="text/xml; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE vxml PUBLIC "-//Nuance/DTD VoiceXML 2.0//EN" "http://voicexml.nuance.com/dtd/nuancevoicexml-2-0.dtd">
<vxml version="2.0">
    <meta http-equiv="Cache-Control" content="no-cache"/>
    <var name="varName" expr="'Mycroft'"/>
    <var name="varVersion" expr="'1.0'"/>
    <var name="ani" expr="session.connection.remote.uri"/>
    <var name="dnis" expr="session.connection.local.uri"/>
    <var name="externalSessionID" expr="session.connection.sessionid"/>
    <var name="canStreamAudio" expr="false"/>
    <data name="laStartSession" src="${apiPath}/startSession" method="post" namelist="varName varVersion ani dnis externalSessionID canStreamAudio" syntax="e4x"/>
    <var name="sessionID" expr="'' + laStartSession.sessionID"/>
    <form>
        <property name="recordutterance" value="true"/>
        <var name="pickList" expr="'speak to an agent|change my tariff|technical support|operator'"/>
        <data name="laStartInteraction" src="${apiPath}/startInteraction" method="post" namelist="sessionID pickList" syntax="e4x"/>
        <field name="whatDoYouWantField">
            <grammar src="${contentPath}/whatdoyouwant.grxml"/>
            <prompt>
                Hello, welcome to the demo, If you briefly tell me why you are calling I'll try to help you immediately.
            </prompt>
            <filled>
                <prompt>
                    Ok got it. You wan't 
                    <value expr="whatDoYouWantField"/>
                </prompt>
                <exit/>
            </filled>
            <noinput>
                <prompt>
                    I didn't hear anything
                </prompt>
            </noinput>
            <nomatch count="1">
                <prompt>
                    I had trouble with that.
                </prompt>
                <var name="recognitionResult" expr="'' + lastresult$.emmatext"/>
                <var name="utterance" expr="'' + lastresult$.recording"/>
                <data name="laSendInteractionResult" src="${apiPath}/sendInteractionResult" method="post" namelist="sessionID recognitionResult utterance" syntax="e4x"/>
                <prompt>
                    Maybe a little differently, like I want to speak to an agent, or I'd like to change my tariff. So tell me, what's the reason for your call?.
                </prompt>
            </nomatch>
            <nomatch count="2">
                <data name="laGetLiveAssistResult" src="${apiPath}/getLiveAssistResult" method="post" namelist="sessionID" syntax="e4x"/>
                <if cond="laGetLiveAssistResult.state == 'agentFilled'">
                    <prompt>
                        Ok I got it with agent's help. You wan't 
                        <value expr="laGetLiveAssistResult.outcome"/>
                    </prompt>
                    <exit/>
                </if>
            </nomatch>
        </field>
    </form>
</vxml>
