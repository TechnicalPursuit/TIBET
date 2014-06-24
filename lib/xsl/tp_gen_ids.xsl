<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:key name="ids" match="//*" use="@id"/>

	<xsl:template name="computeUniqueId">
		<xsl:choose>
			<xsl:when test="not(@id)">
				<xsl:call-template name="generateUniqueId">
					<xsl:with-param name="prefix" select="generate-id()"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@id"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="generateUniqueId">
		<xsl:param name="prefix"/>
		<xsl:param name="suffix"></xsl:param>
		<xsl:variable name="id" select="concat($prefix,$suffix)"/>

		<xsl:choose>
			<xsl:when test="key('ids', $id)">
				<xsl:call-template name="generateUniqueId">
					<xsl:with-param name="prefix" select="$prefix"/>
					<xsl:with-param name="suffix" select="concat($suffix,'x')"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$id"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
