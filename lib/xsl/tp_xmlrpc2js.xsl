<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>

	<xsl:template match="/">
		<topleveltext>
			<xsl:apply-templates mode="process"/>
		</topleveltext>
	</xsl:template>

	<xsl:template match="*" mode="process">
		<xsl:variable name="tmpValue">'<xsl:value-of select="."/>'</xsl:variable>
		<xsl:choose>
			<xsl:when test="name()='string' or name()='base64'">
				<!--<xsl:value-of select="concat($tmpValue , '.entitiesToLiterals()')"/>-->
				<xsl:value-of select="$tmpValue"/>
			</xsl:when>
			<xsl:when test="name()='dateTime.iso8601'">
				<xsl:value-of select="concat('Date.fromString(' , $tmpValue , ')')"/>
			</xsl:when>
			<xsl:when test="name()='i4' or name()='int' or name()='double'">
				<xsl:value-of select="concat('Number.create(', . , ')')"/>
			</xsl:when>
			<xsl:when test="name()='boolean'">
				<xsl:choose>
					<xsl:when test=". = 1">
						<xsl:text>true</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>false</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="name()='array'"><xsl:apply-templates select="data" mode="array"/></xsl:when>
			<xsl:when test="name()='struct'">dc(<xsl:apply-templates select="member" mode="struct"/>)</xsl:when>
			<xsl:otherwise><xsl:value-of select="'null'"/></xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="member" mode="struct">
		<xsl:value-of select="name"/>,<xsl:apply-templates select="value"/>
		<xsl:if test="not (position() = last())">
			<xsl:text>, </xsl:text>
		</xsl:if>
	</xsl:template>

	<xsl:template match="data" mode="array">ac(<xsl:apply-templates select="value"/>)</xsl:template>

	<xsl:template match="value">
		<xsl:apply-templates mode="process"/>
		<xsl:if test="not (position() = last())">
			<xsl:text>, </xsl:text>
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>
