<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="/">
		<form xmlns="http://www.w3.org/1999/xhtml" onsubmit="return false">
			<table cellspacing="0" cellpadding="3" class="uor_table">
				<colgroup span="2">
					<col width="30%"></col>
					<col width="70%"></col>
				</colgroup>
				<thead class="uor_table_title">
					<tr>
						<td>TIBET Control Flags</td>
						<td>Current Setting</td>
					</tr>
				</thead>
				<tbody class="uor_table_data">
					<xsl:apply-templates />
				</tbody>
			</table>
		</form>
	</xsl:template>

	<xsl:template match="/struct/member">
		<tr xmlns="http://www.w3.org/1999/xhtml">
			<td>
				<xsl:value-of select="name"/>
			</td>
			<td>
				<input type="checkbox" onclick="parent.TIBET.{name}(!parent.TIBET.{name}());">
					<xsl:if test="value = 1">
						<xsl:attribute name="checked">checked</xsl:attribute>
					</xsl:if>
				</input>
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
