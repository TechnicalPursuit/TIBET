<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="/">
		<table border="1">
			<xsl:apply-templates />
		</table>
	</xsl:template>

	<xsl:template match="/struct/member">
		<tr>
			<td><xsl:value-of select="name"/></td>
			<td><xsl:value-of select="value"/></td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
