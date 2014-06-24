<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:html="http://www.w3.org/1999/xhtml"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="numCols" select="4"/>

	<xsl:param name="source" select="/array/data/value"/>
	
	<xsl:template match="/">
		<html:table border="1">
			<xsl:apply-templates mode="multiColumn"
								 select="$source[position() &lt;= $numCols]">
				<xsl:with-param name="numCols" select="$numCols"/>
				<xsl:with-param name="nodes" select="$source"/>
			</xsl:apply-templates>
		</html:table>
	</xsl:template>

	<xsl:template match="*" mode="multiColumn">
		<xsl:param name="nodes" select="/.."/>
		<xsl:param name="numCols" select="1"/>

		<xsl:variable name="vCurPosition" select="position()"/>

			<xsl:if test="$vCurPosition mod $numCols = 1">
				<html:tr>
					<xsl:apply-templates mode="normal"
							select="$nodes[position() &gt;= $vCurPosition and position() &lt; $vCurPosition + $numCols]"/>
				</html:tr>
			</xsl:if>

	</xsl:template>
	
	<xsl:template match="*" mode="normal">
		<html:td><xsl:value-of select="."/></html:td>
	</xsl:template>

</xsl:stylesheet>
