<?xml version="1.0" encoding="UTF-8"?>

<!--
This stylesheet is used on content just before it is rendered into a visual
surface. It takes any 'origin' attributes found on 'tibet_listener' elements
and, if they do not have a value of 'ANY', prepends the 'full name' of the
window that the content is being drawn into. This qualifies the origins such
that their 'full ID' reports their destination window.

It also finds any handlers that start with a '#', strips the '#' and prepends
a handler prefix to further qualify the handler. This is normally also the
destination window's full name.
-->

<xsl:stylesheet
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	version="1.0">

	<xsl:output method="xml" indent="yes" />

	<!-- The window's 'full name'. Note that this defaults to the default
			'uicanvas' value. -->
	<xsl:param name="winFullName" select="'tibet://top.ui/'"/>
	<xsl:param name="docFullPath" select="''"/>
	<xsl:param name="handlerPrefix" select="''"/>

	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="@tibet_uri">
		<xsl:attribute name="tibet_uri">
			<xsl:value-of select="concat($winFullName,.)"/>
		</xsl:attribute>
	</xsl:template>

	<xsl:template match="tibet_listener/@origin">
		<!-- First, we go ahead and put a 'local-origin' on the element to
				allow quick access to the original local origin value -->
		<xsl:attribute name="local-origin">
			<xsl:value-of select="."/>
		</xsl:attribute>

		<xsl:choose>
			<xsl:when test=". != 'ANY'">
				<xsl:attribute name="origin">
					<xsl:value-of select="concat($winFullName,$docFullPath,'#',.)"/>
				</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="origin">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="tibet_listener/@target">
		<xsl:choose>
			<xsl:when test=". != 'ANY'">
				<xsl:attribute name="target">
					<xsl:value-of select="concat($winFullName,$docFullPath,'#',.)"/>
				</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="target">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="tibet_listener/@observer">
		<xsl:choose>
			<xsl:when test=". != 'ANY'">
				<xsl:attribute name="observer">
					<xsl:value-of select="concat($winFullName,$docFullPath,'#',.)"/>
				</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="observer">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="tibet_listener/@handler">
		<xsl:choose>
			<xsl:when test="$handlerPrefix != '' and contains(.,'#')">
				<xsl:attribute name="handler">
					<xsl:value-of select="concat($handlerPrefix,'.',substring-after(.,'#'))"/>
				</xsl:attribute>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="handler">
					<xsl:value-of select="."/>
				</xsl:attribute>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
