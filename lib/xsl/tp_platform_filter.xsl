<?xml version="1.0" encoding="UTF-8"?>

<!--
-->

<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:css="http://www.technicalpursuit.com/2006/CSS"
	xmlns:tibet="http://www.technicalpursuit.com/1999/tibet"
	xmlns:html="http://www.w3.org/1999/xhtml">

	<!-- A set of parameters that give the browser major, minor and
			patch version numbers. These default to MOZ 1.7.5
			(Firefox 1.0) -->
	<xsl:param name="browser" select="'moz'"/>
	<xsl:param name="revMajor" select="1"/>
	<xsl:param name="revMinor" select="7"/>
	<xsl:param name="revPatch" select="5"/>


	<xsl:variable name="testRevision">
		<xsl:value-of select="concat($revMajor,$revMinor,$revPatch)"/>
	</xsl:variable>


	<!-- The 'identity transformation', which copies all nodes and attributes
			to the output -->
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
		</xsl:copy>
	</xsl:template>

	<xsl:template match="*[@tibet:platform]">

		<xsl:variable name="initialPlatform">
			<xsl:value-of select="normalize-space(substring-after(substring-before(@tibet:platform,']'),'[if '))"/>
		</xsl:variable>

		<xsl:variable name="platform">
			<xsl:choose>
				<xsl:when test="contains($initialPlatform,'!')">
					<xsl:value-of select="translate($initialPlatform,'!','')"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$initialPlatform"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="testOperator">
			<xsl:choose>
				<xsl:when test="contains($platform,'lt') or contains($platform,'lte') or contains($platform,'gt') or contains($platform,'gte')">
					<xsl:value-of select="normalize-space(substring-before($platform,' '))"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="''"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="testBrowser">
			<xsl:choose>
				<xsl:when test="contains($platform,'lt') or contains($platform,'lte') or contains($platform,'gt') or contains($platform,'gte')">
					<xsl:value-of select="translate(substring-before(substring($platform,string-length($testOperator) + 2),' '),'ABCDEFGHIJKLMNOPQRSTUVQXYZ','abcdefghijklmnopqrstuvwxyz')"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="translate(substring-before($platform,' '),'ABCDEFGHIJKLMNOPQRSTUVQXYZ','abcdefghijklmnopqrstuvwxyz')"/>
				</xsl:otherwise>		
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="testVersion">
			<xsl:choose>
				<xsl:when test="contains($platform,'lt') or contains($platform,'lte') or contains($platform,'gt') or contains($platform,'gte')">
					<xsl:value-of select="translate(substring($platform,string-length($testOperator) + string-length($testBrowser) + 3),'.','')"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="translate(substring-after($platform,' '),'.','')"/>
				</xsl:otherwise>		
			</xsl:choose>
		</xsl:variable>

		<xsl:variable name="testWholeVersion">
			<xsl:choose>
				<xsl:when test="string-length($testVersion) = 1">
					<xsl:value-of select="concat($testVersion,'00')"/>
				</xsl:when>
				<xsl:when test="string-length($testVersion) = 2">
					<xsl:value-of select="concat($testVersion,'0')"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$testVersion"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:choose>
			<xsl:when test="$testOperator = 'lt'">
				<xsl:if test="(($browser = $testBrowser) and (number($testRevision) &lt; number($testWholeVersion)))">
					<xsl:copy>
						<xsl:copy-of select="@*"/>
						<xsl:apply-templates/>
					</xsl:copy>
				</xsl:if>
			</xsl:when>
			<xsl:when test="$testOperator = 'lte'">
				<xsl:if test="(($browser = $testBrowser) and (number($testRevision) &lt;= number($testWholeVersion)))">
					<xsl:copy>
						<xsl:copy-of select="@*"/>
						<xsl:apply-templates/>
					</xsl:copy>
				</xsl:if>
			</xsl:when>
			<xsl:when test="$testOperator = 'gt'">
				<xsl:if test="(($browser = $testBrowser) and (number($testRevision) &gt; number($testWholeVersion)))">
					<xsl:copy>
						<xsl:copy-of select="@*"/>
						<xsl:apply-templates/>
					</xsl:copy>
				</xsl:if>
			</xsl:when>
			<xsl:when test="$testOperator = 'gte'">
				<xsl:if test="(($browser = $testBrowser) and (number($testRevision) &gt;= number($testWholeVersion)))">
					<xsl:copy>
						<xsl:copy-of select="@*"/>
						<xsl:apply-templates/>
					</xsl:copy>
				</xsl:if>
			</xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<xsl:when test="contains($initialPlatform,'!')">
						<xsl:if test="(($browser != $testBrowser) or (number($testRevision) != number($testWholeVersion)))">							<xsl:copy>
								<xsl:copy-of select="@*"/>
								<xsl:apply-templates/>
							</xsl:copy>
						</xsl:if>
					</xsl:when>
					<xsl:otherwise>
						<xsl:if test="(($browser = $testBrowser) and (number($testRevision) = number($testWholeVersion)))">
							<xsl:copy>
								<xsl:copy-of select="@*"/>
								<xsl:apply-templates/>
							</xsl:copy>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>

	</xsl:template>

</xsl:stylesheet>
