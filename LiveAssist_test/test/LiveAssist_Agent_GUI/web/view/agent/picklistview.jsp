<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<script type="text/javascript">
    function getRadioVal(radioName)
    {
        var rads = document.getElementsByName(radioName);

        for(var rad in rads) {
            if(rads[rad].checked)
                return rads[rad].value;
        }

        return null;
    }
    function enableEdit()
    {
        document.getElementById("otherText").disabled=!(getRadioVal("pickListSelection") === "other");
    }
</script>

<h2>Outcome selection</h2>
<p>You have to select from the following outcomes : </p>
<form:form  method="post" action="sessionSetOutcome" modelAttribute="outcome">
    <c:if test="${not empty session.pickList}">
        <table> <tbody>
        <c:forEach var="o" items="${session.pickList}">
            <tr><td>
                <form:radiobutton path="pickListSelection" value="${o}" onchange="enableEdit()"/> ${o}
            </td></tr>
        </c:forEach>
        <tr><td>
            <form:radiobutton path="pickListSelection" value="other" onchange="enableEdit()"/> Other
            <form:input path="otherText" disabled="true" readonly="false"/>
        </td>
        </tr>
        <tr> <td>
            <form:hidden path="sessionId" value="${session.id}"/>
            <input type="submit" value="Send your choice">
        </td> </tr>
        </tbody>
        </table>
    </c:if>
</form:form>
