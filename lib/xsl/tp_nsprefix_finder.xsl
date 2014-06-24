<?xml version="1.0" encoding="UTF-8"?>

<!--
-->

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<xsl:param name="searchURI" select="'http://www.w3.org/1999/XSL/Transform'" />
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

	<xsl:template match="@*|node()">
		<xsl:if test="namespace-uri(.) = $searchURI">
			<xsl:value-of select="concat(substring-before(name(.),':'),',')"/>
		</xsl:if>
		<xsl:apply-templates select="@*|node()"/>
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
