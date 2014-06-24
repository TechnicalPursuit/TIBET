<?xml version="1.0"?>

<!--    XPath Visualiser,
	 by Dimitre Novatchev, dnovatchev@yahoo.com
 
This is a customisation of the original DEFAULTSS.XSL 
written by Johnatan Marsh. The changes that had to be made 
are listed below:

1. The original stylesheet was modified to work 
with the XSLT default namespace uri: 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform".

2. The modifications above include a completely new way
of detecting namespace node definitions - something that
was not provided by the old DEFAULTSS.XSL and is in fact 
considered impossile (see Mike Kay's book, page 60).
In fact this still doesn't mean Mike's wrong - note the
critical importance of using the vxpathuser:getxml() xtn f-n.

3. A global parameter named "selectedNodes" was added.

4. Additional logic was added to all templates 
to recognise whether the current match belongs to
the $selectedNodes nodeset.

5. All nodes that belong to the $selectedNodes nodeset 
are treated in a special way - hi-lighted.

6. All container nodes that are collapsed and hide selections
are also specially hi-lighted. Thus it is possile to have a minimum
length display of the xml source that still shows all selected nodes.

Known issues:
1. This tool will not display selected nodes that were not explicitly
specified in the text of the xml source document. Most notably this is
true for (propagated) namespace nodes and for default/implied attributes
that were specified in a DTD and not explicitly specified in the text
of the source document.
However, the containing nodes are still hi-lighted to indicate the presence
of such selected and not specified in the text nodes.

2.A bug in all MSXML processors before September sometimes
prevents the correct finding and hilighting of nodes that are 
specified by the XPath expression.

What happens is that sometimes, according to MSXML 
count(nodeset | member-node) != count(nodeset)

I have reported this bug to Microsoft twice (every month since June)
and it seems to have been fixed in their September Release.
 -->

<!-- Original comment block by Jonathan Marsh (jmarsh@microsoft.com) -->
<!--
  IE5 default style sheet, provides a view of any XML document
  and provides the following features:
  - auto-indenting of the display, expanding of entity references
  - click or tab/return to expand/collapse
  - color coding of markup
  - color coding of recognized namespaces - xml, xmlns, xsl, dt
  
  This style sheet is available in IE5 in a compact form at the URL
  "res://msxml.dll/DEFAULTSS.xsl".  This version differs only in the
  addition of comments and whitespace for readability.
  
  Author:  Jonathan Marsh (jmarsh@microsoft.com)
-->

<xsl:stylesheet  version="1.0" 	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:dt="urn:schemas-microsoft-com:datatypes"
                xmlns:d2="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882"
				xmlns:msxsl="urn:schemas-microsoft-com:xslt" 
				xmlns:vxpathuser="myvxpathnamespace"
				>
				
<xsl:param name="selectedNodes" select="@comment()"/>
<xsl:param name="scalarExpr" select="@comment()"/>
<xsl:param name="isScalar" select="0"/>
<xsl:variable name="nodesWithSelectedOffspring" 
select="//*[(* | */@* | text() | */processing-instruction() | */comment() 
			| */namespace::*)[count(. | $selectedNodes) 
			= count($selectedNodes)]]/./ancestor-or-self::*" 
/>

<xsl:template match="/">
	<HTML>
		<HEAD>
			<TITLE ID="cntMatches"><xsl:value-of select="count($selectedNodes)"/></TITLE>
			<STYLE>
			BODY
			{
				color: #00F;
				font: 12px Tahoma,Verdana,Arial,Helvetica,sans-serif;
				margin-right: 1.5em;
			}

			<!-- container for expanding/collapsing content -->
			.c {cursor:hand}

			<!-- selected nodes: Hi-lighted -->
			.xpathSelection
			{
				background-color: #CCCCCC;
			}

      <!-- selected nodes: Current Selection - Hi-lighted -->
        .cse  {background-Color:#F2AAF7}

			<!-- button - contains +/-/nbsp -->
			span.toggle
			{
				font-weight: bold;
			}

			a.toggle
			{
				color: red;
				font-weight: bold;
				text-decoration: none;
			}

			<!-- button of an element that contains selected sub-elements - contains +/-/nbsp -->
			a.toggle_select
			{
				color: red;
				font-weight: bold;
				text-decoration: none;
			/*	background-Color: #3300ff; */
			}

      <!-- element container -->
        .e  {margin-left:1em; text-indent:-1em; margin-right:1em}
      <!-- comment or cdata -->
        .k  {margin-left:1em; text-indent:-1em; margin-right:1em}

			<!-- tag -->
			.t
			{
				color: #990000;
			}

      <!-- tag in xsl namespace -->
        .xt {color:#000099}

		<!-- attribute in xml or xmlns namespace -->
		.namespace
		{
			color: red;
		}

      <!-- attribute in dt namespace -->
        .dt {color:green}

			<!-- markup characters -->
			.markup
			{
				color: blue;
			}

			<!-- text node -->
			.text
			{
				color: black;
				font-weight: bold;
			}

      <!-- multi-line (block) cdata -->
        .db {text-indent:0px; margin-left:1em; margin-top:0px; margin-bottom:0px; padding-left:.3em; border-left:1px solid #CCCCCC; font:small Courier}
      <!-- single-line (inline) cdata -->
        .di {font:small Courier}
      <!-- DOCTYPE declaration -->
        .d  {color:blue}

			<!-- pi -->
			.pi
			{
				color: #999999;
			}

      <!-- multi-line (block) comment -->
        .cb {text-indent:0px; margin-left:1em; margin-top:0px; margin-bottom:0px;
             padding-left:.3em; font:small Courier; color:#888888}
      <!-- single-line (inline) comment -->
        .ci {font:small Courier; color:#888888}
	  <!-- implied/default attribute name and value -->
	    .dfa {font:small Courier; color:#888888}
        PRE {margin:0px; display:inline}
      </STYLE>

      <SCRIPT><xsl:comment><![CDATA[
        // Detect and switch the display of CDATA and comments from an inline view
        //  to a block view if the comment or CDATA is multi-line.
        function f(e)
        {
          // if this element is an inline comment, and contains more than a single
          //  line, turn it into a block comment.
          if (e.className == "ci") {
            if (e.children(0).innerText.indexOf("\n") > 0)
              fix(e, "cb");
          }
          
          // if this element is an inline cdata, and contains more than a single
          //  line, turn it into a block cdata.
          if (e.className == "di") {
            if (e.children(0).innerText.indexOf("\n") > 0)
              fix(e, "db");
          }
          
          // remove the id since we only used it for cleanup
          e.id = "";
        }
        
        // Fix up the element as a "block" display and enable expand/collapse on it
        function fix(e, cl)
        {
          // change the class name and display value
          e.className = cl;
          e.style.display = "block";
          
          // mark the comment or cdata display as a expandable container
          j = e.parentElement.children(0);
          j.className = "c";

          // find the +/- symbol and make it visible - the dummy link enables tabbing
          k = j.children(0);
          k.style.visibility = "visible";
          k.href = "#";
        }

        // Change the +/- symbol and hide the children.  This function works on "element"
        //  displays
        function ch(e)
        {
          // find the +/- symbol
          mark = e.children(0).children(0);
          
          // if it is already collapsed, expand it by showing the children
          if (mark.innerText == "+" || mark.innerText == "*" )
          {
            mark.innerText = "-";
            for (var i = 1; i < e.children.length; i++)
              e.children(i).style.display = "block";
          }
          
          // if it is expanded, collapse it by hiding the children
          else if (mark.innerText == "-")
          {
            if(mark.className == "bs")
				mark.innerText = "*";
			else
				mark.innerText = "+";

            for (var i = 1; i < e.children.length; i++)
              e.children(i).style.display="none";
          }
        }
        
        // Change the +/- symbol and hide the children.  This function work on "comment"
        //  and "cdata" displays
        function ch2(e)
        {
          // find the +/- symbol, and the "PRE" element that contains the content
          mark = e.children(0).children(0);
          contents = e.children(1);
          
          // if it is already collapsed, expand it by showing the children
          if (mark.innerText == "+")
          {
            mark.innerText = "-";
            // restore the correct "block"/"inline" display type to the PRE
            if (contents.className == "db" || contents.className == "cb")
              contents.style.display = "block";
            else contents.style.display = "inline";
          }
          
          // if it is expanded, collapse it by hiding the children
          else if (mark.innerText == "-")
          {
            mark.innerText = "+";
            contents.style.display = "none";
          }
        }
        
        // Handle a mouse click
        function cl()
        {
          e = window.event.srcElement;
          
          // make sure we are handling clicks upon expandable container elements
          if (e.className != "c")
          {
            e = e.parentElement;
            if (e.className != "c")
            {
              return;
            }
          }
          e = e.parentElement;
          
          // call the correct funtion to change the collapse/expand state and display
          if (e.className == "e")
            ch(e);
          if (e.className == "k")
            ch2(e);
        }

        // Dummy function for expand/collapse link navigation - trap onclick events instead
        function ex() 
        {}

        // Erase bogus link info from the status window
        function h()
        {
          window.status=" ";
        }

        // Set the onclick handler
        document.onclick = cl;
        
      ]]></xsl:comment></SCRIPT>
    </HEAD>

    <!-- bgcolor="#ccffff" -->
    <!-- bgcolor="#E3FAFB" -->
    <!-- bgcolor="#D0FDEB" -->
	<BODY id="theBody" title="{$scalarExpr}">
		<xsl:apply-templates/>
	</BODY>

  </HTML>
</xsl:template>


<!-- Templates for each node type follows.  The output of each template has a similar structure
  to enable script to walk the result tree easily for handling user interaction. -->

<!-- Template for pis not handled elsewhere -->
<xsl:template match="processing-instruction()">
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>
  <DIV class="e">
  <SPAN class="toggle"> </SPAN>
  <SPAN class="markup">&lt;?</SPAN>

  <xsl:choose>
  	<xsl:when test="$belongs=0">
	  <SPAN id="Selected" class="xpathSelection"><xsl:value-of select="name()"/>
	  <xsl:text>&#160;</xsl:text><xsl:value-of select="."/></SPAN>	
	</xsl:when>
	<xsl:otherwise>	
	  	<SPAN class="pi"><xsl:value-of select="name()"/>
		<xsl:text>&#160;</xsl:text><xsl:value-of select="."/></SPAN>	
	</xsl:otherwise>	
  </xsl:choose>
  <xsl:text>&#160;</xsl:text>
  <SPAN class="markup">?&gt;</SPAN>
  </DIV>
</xsl:template>

<!-- Template for the XML declaration.  Need a separate template because the pseudo-attributes
    are actually exposed as attributes instead of just element content, as in other pis -->
<xsl:template match="processing-instruction('xml')">

  <DIV class="e">
  <SPAN class="toggle"><xsl:value-of select="string(' ')"/>  </SPAN>
  <SPAN class="markup">&lt;?</SPAN>
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>

  <xsl:text>&#160;</xsl:text>
  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<SPAN id="Selected" class="xpathSelection">xml <xsl:for-each select="@*"><xsl:value-of select="name()"/>="<xsl:value-of select="."/>" </xsl:for-each></SPAN>
	</xsl:when>
	<xsl:otherwise>
  		<SPAN class="pi">xml <xsl:for-each select="@*"><xsl:value-of select="name()"/>="<xsl:value-of select="."/>" </xsl:for-each></SPAN>
	</xsl:otherwise>
  </xsl:choose>
  <SPAN class="markup">?&gt;</SPAN>
  </DIV>
</xsl:template>

<!-- Template for attributes not handled elsewhere -->
<xsl:template match="@*|@xmlns:*|@xmlns|@xml:*|@dt:*|@d2:*" > <!-- xml:space="preserve" -->
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>
	<xsl:variable name="parentXML" select="normalize-space(vxpathuser:getxml(..))"/>
	<xsl:variable name="bImplied" 
				select="not(contains($parentXML, concat(' ', name(), '=')) 
				or contains($parentXML, concat(' ', name(), ' =')))"/>
  
  <xsl:text>&#160;</xsl:text>
  <xsl:choose>
  	<xsl:when test="$belongs=0">
		<pre><SPAN id="Selected" class="xpathSelection">
		<xsl:choose>
			<xsl:when test="$bImplied">
				<xsl:attribute name="title">default/implied</xsl:attribute>
			</xsl:when>
		</xsl:choose>
		<B><font size="+0.5" face="Verdana"><xsl:value-of select="vxpathuser:getxml(.)"/></font></B> </SPAN></pre>
	</xsl:when>
	<xsl:otherwise>
		<SPAN>
		<xsl:choose>
			<xsl:when test="$bImplied">
				<xsl:attribute name="class">dfa</xsl:attribute>
				<xsl:attribute name="title">default/implied</xsl:attribute>
				<b>
				<xsl:value-of select="name()"/>
				</b><SPAN class="markup">="</SPAN>
				<pre><SPAN class="dfa">
				<xsl:value-of select="." disable-output-escaping="yes"/>
				 </SPAN></pre><SPAN class="markup">"</SPAN>
			</xsl:when>
			<xsl:otherwise>
				<xsl:attribute name="class">
				<xsl:if test="starts-with(name(), 'xsl:')">x</xsl:if>t</xsl:attribute>
				<b>
				<xsl:value-of select="name()"/>
				</b><SPAN class="markup">="</SPAN>
				<pre><SPAN class="text"><font size="+0.1" face="Verdana">
				<xsl:value-of select="." disable-output-escaping="yes"/>
				 </font></SPAN></pre><SPAN class="markup">"</SPAN>
			</xsl:otherwise>
		</xsl:choose>
		</SPAN>
	</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- Template for attributes in the dt namespace -->
<xsl:template match="@dt:*|@d2:*">
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>
  <xsl:text>&#160;</xsl:text>
  <xsl:choose>
  	<xsl:when test="$belongs=0">
		<SPAN id="Selected" class="xpathSelection"> 
		<xsl:value-of select="name()"/>=<xsl:value-of select="."/></SPAN>
	</xsl:when>
	<xsl:otherwise>
		<SPAN class="dt"> <xsl:value-of select="name()"/></SPAN>
		<SPAN class="markup">="</SPAN><B class="dt"><xsl:value-of select="."/></B><SPAN class="markup">"</SPAN>
	</xsl:otherwise>
  </xsl:choose>
		</xsl:template>

<!-- Template for text nodes -->
<xsl:template match="text()">


<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>
  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<pre><SPAN id="Selected" class="xpathSelection"><font size="+0.5" face="Verdana">
		<b><xsl:value-of select="vxpathuser:getxml(.)"/></b></font></SPAN></pre>
	</xsl:when>
	<xsl:otherwise>
  		<pre><SPAN class="text"><font size="+0.5" face="Verdana">
		<b><xsl:value-of select="vxpathuser:getxml(.)"/></b></font> 
		</SPAN></pre>
	</xsl:otherwise>
  </xsl:choose>

</xsl:template>


<!-- Note that in the following templates for comments and cdata, by default we apply a style
  appropriate for single line content (e.g. non-expandable, single line display).  But we also
  inject the attribute 'id="clean"' and a script call 'f(clean)'.  As the output is read by the
  browser, it executes the function immediately.  The function checks to see if the comment or
  cdata has multi-line data, in which case it changes the style to a expandable, multi-line
  display.  Performing this switch in the DHTML instead of from script in the XSL increases
  the performance of the style sheet, especially in the browser's asynchronous case -->
  
<!-- Template for comment nodes -->
<xsl:template match="comment()">
  <DIV class="k">
  <SPAN><A class="toggle" onclick="return false" onfocus="h()" style="visibility:hidden">-</A> <SPAN class="markup">&lt;!--</SPAN></SPAN>
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>

  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<SPAN id="Selected"></SPAN><SPAN id="clean" class="xpathSelection"><PRE><xsl:value-of select="."/></PRE></SPAN>
	</xsl:when>
	<xsl:otherwise>
  		<SPAN id="clean" class="ci"><PRE><xsl:value-of select="."/></PRE></SPAN>
	</xsl:otherwise>
  </xsl:choose>
  <SPAN class="toggle"><xsl:value-of select="string(' ')"/></SPAN> <SPAN class="markup">--&gt;</SPAN>
  <SCRIPT>f(clean);</SCRIPT></DIV>
</xsl:template>

<!-- Template for cdata nodes 
<xsl:template match="node()[true()=vxpathuser:cdata(.)]" >
  <DIV class="k">
  <SPAN><A class="toggle" onclick="return false" onfocus="h()" STYLE="visibility:hidden">-</A> <SPAN class="markup">&lt;![CDATA[</SPAN></SPAN>
  <SPAN id="clean" class="di"><PRE><xsl:value-of select="."/></PRE></SPAN>
  <SPAN class="toggle"><xsl:value-of select="string(' ')"/></SPAN> <SPAN class="markup">]]&gt;</SPAN>
  <SCRIPT>f(clean);</SCRIPT></DIV>
</xsl:template>
-->

<!-- Note the following templates for elements may examine children.  This harms to some extent
  the ability to process a document asynchronously - we can't process an element until we have
  read and examined at least some of its children.  Specifically, the first element child must
  be read before any template can be chosen.  And any element that does not have element
  children must be read completely before the correct template can be chosen. This seems 
  an acceptable performance loss in the light of the formatting possibilities available 
  when examining children. -->

<!-- Template for elements not handled elsewhere (leaf nodes) -->
<xsl:template match="*">

  <DIV class="e"><DIV STYLE="margin-left:1em;text-indent:-2em">
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>

  <SPAN class="toggle"><xsl:value-of select="string(' ')"/></SPAN>
  <SPAN class="markup">&lt;</SPAN>

  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<SPAN id="Selected" class="xpathSelection"><xsl:value-of select="name()"/></SPAN>
	</xsl:when>
	<xsl:otherwise>
  		<SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN>
	</xsl:otherwise>
  </xsl:choose>
  
  <xsl:call-template name="getNamespaceNodes"/>  
 
  <xsl:apply-templates select="@*|@xmlns:*|@xmlns|@xml:*|@dt:*|@d2:*"/><SPAN class="markup"> /&gt;</SPAN>
  </DIV></DIV>
</xsl:template>
  
<!-- Template for elements with comment, pi and/or cdata children -->
<xsl:template match="*[node()]">

  <DIV class="e">
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>

  <DIV class="c"><A href="#" onclick="return false" onfocus="h()" class="toggle">-</A> <SPAN class="markup">&lt;</SPAN>

  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<SPAN id="Selected" class="xpathSelection"><xsl:value-of select="name()"/></SPAN>
	</xsl:when>
	<xsl:otherwise>
  		<SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN>
	</xsl:otherwise>
  </xsl:choose>
  
  <xsl:call-template name="getNamespaceNodes"/>  
 
  <xsl:apply-templates select="@*|@xmlns:*|@xmlns|@xml:*|@dt:*|@d2:*"/> <SPAN class="markup">&gt;</SPAN></DIV>
  <DIV><xsl:apply-templates/>
  <DIV><SPAN class="toggle"><xsl:value-of select="string(' ')"/></SPAN> <SPAN class="markup">&lt;/</SPAN>

  <SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN>
  <SPAN class="markup">&gt;</SPAN></DIV>
  </DIV></DIV>
</xsl:template>

<!-- Template for elements with only text children -->
<xsl:template match="*[text()and not(comment()or processing-instruction())]">

  <DIV class="e"><DIV STYLE="margin-left:1em;text-indent:-2em">
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>

  <SPAN class="toggle"><xsl:value-of select="string(' ')"/></SPAN> <SPAN class="markup">&lt;</SPAN>

  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<SPAN id="Selected" class="xpathSelection"><xsl:value-of select="name()"/></SPAN>
	</xsl:when>
	<xsl:otherwise>
  		<SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN>
	</xsl:otherwise>
  </xsl:choose>
  
  <xsl:call-template name="getNamespaceNodes"/>  
 
  <xsl:apply-templates select="@*|@xmlns:*|@xmlns|@xml:*|@dt:*|@d2:*"/>
  <SPAN class="markup">&gt;</SPAN>
  
  <!-- <SPAN class="text"><xsl:value-of select="."/></SPAN> -->
  <xsl:apply-templates/>
  
  <SPAN class="markup">&lt;/</SPAN>
  <SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN>
  <SPAN class="markup">&gt;</SPAN>
  </DIV></DIV>
</xsl:template>

<!-- Template for processing the namespace nodes -->
<xsl:template name="getNamespaceNodes" >
  <xsl:variable name="parentElementText">
	  <xsl:for-each select="..">
		  <xsl:copy >
		  <xsl:apply-templates select="comment()"/>
		  </xsl:copy >
	  </xsl:for-each>
  </xsl:variable>
  
  <xsl:for-each select="namespace::*[position() > 1]">
	<xsl:if test="not(parent::*/parent::*) or not(contains(vxpathuser:getxml($parentElementText), vxpathuser:getxml(.)))" >
		<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>
		  <SPAN class="markup"><xsl:text>&#160;</xsl:text></SPAN>
		  <xsl:choose>
		  	<xsl:when test="$belongs=0">
			<SPAN id="Selected" class="xpathSelection"> <xsl:value-of select="vxpathuser:getxml(.)"/></SPAN>
			</xsl:when>
			<xsl:otherwise>
				<SPAN class="ns"> 
				<xsl:value-of select="'xmlns'"/>
				<xsl:if test="local-name()">
				  <xsl:value-of select="concat(':', local-name())"/>
				</xsl:if>
				</SPAN>
				
				<SPAN class="markup">="</SPAN>
				<B class="ns"><xsl:value-of select="."/></B>
				<SPAN class="markup">"</SPAN>
				<!-- <xsl:value-of select="vxpathuser:getxml(.)"/></SPAN> -->
			</xsl:otherwise>
		  </xsl:choose>
		<!-- <xsl:text> </xsl:text><xsl:value-of select="vxpathuser:getxml(.)"/> -->
	</xsl:if>
	
  </xsl:for-each>
</xsl:template>



<!-- Template for elements with element children -->
<xsl:template match="*[*]">

<DIV class="e">
<xsl:variable name="belongs" select="count($selectedNodes|.)-count($selectedNodes)"/>

<xsl:variable name="hasSelectedOffspring" 
select="count($nodesWithSelectedOffspring|.)-count($nodesWithSelectedOffspring)"
/>

<DIV class="c" STYLE="margin-left:1em;text-indent:-2em">
  <xsl:choose>
  	<xsl:when test="$hasSelectedOffspring=0">
  <A href="#" onclick="return false" onfocus="h()" class="toggle_select">-</A> <SPAN class="markup">&lt;</SPAN>
	</xsl:when>
	<xsl:otherwise>
<A href="#" onclick="return false" onfocus="h()" class="toggle">-</A> <SPAN class="markup">&lt;</SPAN>
	</xsl:otherwise>
  </xsl:choose>

  <xsl:choose>
  	<xsl:when test="$belongs=0">
  		<SPAN id="Selected" class="xpathSelection"><xsl:value-of select="name()"/></SPAN>
	</xsl:when>
	<xsl:otherwise>
  		<SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN>
	</xsl:otherwise>
  </xsl:choose>

  <xsl:call-template name="getNamespaceNodes"/>  
 
  <xsl:apply-templates select="@*|@xmlns:*|@xmlns|@xml:*|@dt:*|@d2:*"/>

  <SPAN class="markup">&gt;</SPAN></DIV>
  <DIV><xsl:apply-templates/>
  <DIV><SPAN class="toggle"><xsl:value-of select="string(' ')"/></SPAN>
  <SPAN class="markup">&lt;/</SPAN>
  <SPAN><xsl:attribute name="class"><xsl:if test="self::xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></SPAN><SPAN class="markup">&gt;</SPAN></DIV>
  </DIV></DIV>
</xsl:template>

<msxsl:script implements-prefix="vxpathuser">
<![CDATA[ 
    function getxml(node)
    {
      return node(0).xml; //now();
    }
	
	function nodeType(node)
	{
		return node(0).nodeType();
	}
	function cdata(node)
	{
		return (node(0).nodeType() == 4); //CData == 4
	}
  ]]> 
  </msxsl:script>
</xsl:stylesheet>

