<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="skipOpaque" select="'true'"/>

	<xsl:template match="/">
		<xsl:variable name="allContent">
			<xsl:apply-templates/>
		</xsl:variable>
		<array>
			<data>
				<xsl:call-template name="removeDuplicates">
					<xsl:with-param name="strTemp" select="$allContent"/>
				</xsl:call-template>
			</data>
		</array>
	</xsl:template>

	<xsl:template match="*">
		<xsl:if test="namespace-uri(.) != '' and (($skipOpaque = 'false') or ($skipOpaque = 'true' and not(ancestor-or-self::*/@tibet:opaque)))">
			<xsl:value-of select="concat(namespace-uri(.),',')"/>
		</xsl:if>
		<xsl:apply-templates select="@*|*"/>
	</xsl:template>

	<xsl:template match="@*">
		<xsl:if test="namespace-uri(.) != ''">
			<xsl:value-of select="concat(namespace-uri(.),',')"/>
		</xsl:if>
		<xsl:apply-templates select="@*|*"/>
	</xsl:template>

	<xsl:template name="removeDuplicates">
		<xsl:param name="strTemp"/>
		<xsl:choose>
			<xsl:when test="contains($strTemp,',')">
				<xsl:variable name="tmpFirst" select="substring-before($strTemp,',')"/>
				<xsl:variable name="tmpRest" select="substring-after($strTemp,',')"/>
				<xsl:if test="not(contains($tmpRest,$tmpFirst))">
				<value>
					<string>
						<xsl:value-of select="$tmpFirst"/>
					</string>
				</value>
				</xsl:if>

				<!-- If there is more content, then recurse down, removing
						that content as well -->
				<xsl:if test="$tmpRest != ''">
					<xsl:call-template name="removeDuplicates">
						<xsl:with-param name="strTemp" select="$tmpRest"/>
					</xsl:call-template>
				</xsl:if>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
