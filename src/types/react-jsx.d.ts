import React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-api-loader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        key?: string;
        'solution-channel'?: string;
      }, HTMLElement>;
      
      'gmpx-place-picker': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        placeholder?: string;
        country?: string;
        type?: string;
        id?: string;
        'for-map'?: string;
        className?: string;
        value?: any;
        onchange?: (event: any) => void;
      }, HTMLElement>;
      
      'gmpx-place-overview': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        place?: string;
        size?: 'small' | 'medium' | 'large' | 'xlarge';
        slot?: string;
        'google-logo-already-displayed'?: boolean;
      }, HTMLElement>;
      
      'gmpx-overlay-layout': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        ref?: any;
      }, HTMLElement>;
      
      'gmpx-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        slot?: string;
        icon?: string;
        'aria-label'?: string;
        onClick?: () => void;
      }, HTMLElement>;
      
      'gmpx-place-directions-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        slot?: string;
      }, HTMLElement>;
      
      'gmpx-split-layout': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'gmpx-route-overview': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'gmpx-store-locator': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
