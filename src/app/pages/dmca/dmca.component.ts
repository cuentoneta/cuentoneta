import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'cuentoneta-dmca',
	standalone: true,
	imports: [CommonModule],
	template: `
		<main class="lg:mt-28">
			<h1 class="title">Disclaimer for La Cuentoneta</h1>

			<section class="mb-8">
				<p>
					If you require any more information or have any questions about our site's disclaimer, please feel free to
					contact us by email at contacto&#64;cuentoneta.ar.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="subtitle">Disclaimers for <em>La Cuentoneta</em></h2>
				<p>
					All the information on this website - cuentoneta.ar - is published in good faith and for general information
					purpose only. La Cuentoneta does not make any warranties about the completeness, reliability and accuracy of
					this information. Any action you take upon the information you find on this website (La Cuentoneta), is
					strictly at your own risk. La Cuentoneta will not be liable for any losses and/or damages in connection with
					the use of our website.
				</p>
				<br />
				<p>
					From our website, you can visit other websites by following hyperlinks to such external sites. While we strive
					to provide only quality links to useful and ethical websites, we have no control over the content and nature
					of these sites. These links to other websites do not imply a recommendation for all the content found on these
					sites. Site owners and content may change without notice and may occur before we have the opportunity to
					remove a link which may have gone 'bad'.
				</p>
				<br />
				<p>
					Please be also aware that when you leave our website, other sites may have different privacy policies and
					terms which are beyond our control. Please be sure to check the Privacy Policies of these sites as well as
					their "Terms of Service" before engaging in any business or uploading any information.
				</p>
				<br />
				<p>
					La Cuentoneta respects the intellectual property of others. cuentoneta.ar takes matters of Intellectual
					Property very seriously and is committed to meeting the needs of content owners while helping them manage
					publication of their content online. It should be noted that cuentoneta.ar only reproduces information already
					available in other websites, which are linked below with information about where each story has been taken
					from.
				</p>
				<br />
				<p>
					If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and
					is accessible on this site, you may notify our copyright agent, as set forth in the
					<a href="https://www.copyright.gov/legislation/dmca.pdf">Digital Millennium Copyright Act of 1998 (DMCA)</a>.
					For your complaint to be valid under the DMCA, you must provide the following information when providing
					notice of the claimed copyright infringement: A physical or electronic signature of a person authorized to act
					on behalf of the copyright owner Identification of the copyrighted work claimed to have been infringed
					Identification of the material that is claimed to be infringing or to be the subject of the infringing
					activity and that is to be removed Information reasonably sufficient to permit the service provider to contact
					the complaining party, such as an address, telephone number, and, if available, an electronic mail address A
					statement that the complaining party "in good faith believes that use of the material in the manner complained
					of is not authorized by the copyright owner, its agent, or law" A statement that the "information in the
					notification is accurate", and "under penalty of perjury, the complaining party is authorized to act on behalf
					of the owner of an exclusive right that is allegedly infringed" The above information must be submitted as a
					written, faxed or emailed notification to the following Designated Agent: Attn: DMCA Office Contact Us :
					http://www.watchdogsecurity.online
				</p>
			</section>

			<section class="mb-8">
				<h2 class="subtitle">Consent</h2>
				<p>By using our website, you hereby consent to our disclaimer and agree to its terms.</p>
			</section>

			<section class="mb-8">
				<h2 class="subtitle">Update</h2>
				<p>
					Should we update, amend or make any changes to this document, those changes will be prominently posted here.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="subtitle">Original Sources</h2>
				<p>
					In order to demonstrate that La Cuentoneta solely serves as a platform for reproducing existing content, each
					non-original asset sourced from external contributors and other platforms includes a prominently displayed and
					easily accessible link to its original source.
				</p>
			</section>
		</main>
	`,
	styleUrls: ['./dmca.component.scss'],
})
export class DmcaComponent {}
