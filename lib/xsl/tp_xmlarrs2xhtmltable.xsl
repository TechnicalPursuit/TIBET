<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:template match="/">
		<html:table style="border: solid 1px black; border-spacing: 0; border-collapse: collapse">
			<xsl:apply-templates select="*"/>
		</html:table>
	</xsl:template>

	<!-- Rows -->
	<xsl:template match="/dataroot/*[starts-with(local-name(), 'item')]">
		<html:tr>
			<xsl:if test="position() mod 2 != 1">
				<xsl:attribute name="style">background-color: #dddddd</xsl:attribute>
			</xsl:if>
			<xsl:apply-templates select="*"/>
		</html:tr>
	</xsl:template>

	<!-- Header Columns -->
	<xsl:template match="*[starts-with(local-name(), 'item') and position() = 1]/*[starts-with(local-name(), 'item')]">
		<html:th style="background-color: gray; color: white; border: solid 1px black">
			<xsl:value-of select="text()"/>
		</html:th>
	</xsl:template>

	<!-- Data Columns -->
	<xsl:template match="*[starts-with(local-name(), 'item') and position() > 1]/*[starts-with(local-name(), 'item')]">
		<html:td style="border: solid 1px black">
			<xsl:value-of select="text()"/>
		</html:td>
	</xsl:template>

</xsl:stylesheet>
