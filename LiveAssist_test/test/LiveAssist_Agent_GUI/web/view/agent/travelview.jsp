<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>

<h2>Travel outcome selection</h2>
<p>You have to select the caller travel intent : </p>
<form:form  method="post" action="sessionSendOutcome" modelAttribute="outcomeForm">
    <table>
        <tbody>

        <tr>
            <td class="centered">
                TRAVEL FROM
            </td>
        <td>
        <select name="outcomeValues['originCity']" class="select">
            <option value="Montreal" selected="true">Montreal</option>
            <option value="Boston">Boston</option>
            <option value="Ottawa">Ottawa</option>
            <option value="New York">New York</option>
        </select>
        </td>
        </tr>

        <tr>
            <td class="centered">
                TO
            </td>
            <td>
                <select name="outcomeValues['destinationCity']" class="select">
                    <option value="Montreal">Montreal</option>
                    <option value="Boston" selected="true">Boston</option>
                    <option value="Ottawa">Ottawa</option>
                    <option value="New York">New York</option>
                </select>
            </td>
        </tr>

        <tr>
            <td class="centered">
                ON
            </td>
            <td>
                <select name="outcomeValues['departureDay']" class="select">
                    <option value="Monday" selected="true">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
            </td>
        </tr>

        <tr> <td>
            <form:hidden path="sessionId" value="${session.id}"/>
            <input type="submit" value="Send your choice">
        </td> </tr>
        </tbody>
    </table>
</form:form>
